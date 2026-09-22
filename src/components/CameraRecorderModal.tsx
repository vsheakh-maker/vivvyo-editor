import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, SwitchCamera, Circle, Square, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { VideoAsset } from '../types.ts';

interface CameraRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoRecorded: (video: VideoAsset) => void;
}

export const CameraRecorderModal: React.FC<CameraRecorderModalProps> = ({
  isOpen,
  onClose,
  onVideoRecorded,
}) => {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // stop stream when modal closes
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      setIsRecording(false);
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordDuration(0);
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setErrorMsg(null);
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });
        activeStream = s;
        setStream(s);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = s;
          videoPreviewRef.current.play().catch((err) => console.warn('Camera preview play error:', err));
        }
      } catch (err: unknown) {
        console.error('Camera access error', err);
        const message = err instanceof Error ? err.message : 'Please allow camera and microphone permissions.';
        setErrorMsg(`Camera error: ${message}`);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  const toggleFacing = () => {
    if (isRecording) return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordedUrl(null);

    let mimeType = 'video/webm;codecs=vp8,opus';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }

    const mr = new MediaRecorder(stream, { mimeType });
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
    };

    mediaRecorderRef.current = mr;
    mr.start(100);
    setIsRecording(true);
    setRecordDuration(0);

    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      setRecordDuration(Math.floor((Date.now() - start) / 1000));
    }, 500);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleUseVideo = () => {
    if (!recordedUrl || !recordedBlob) return;
    const newAsset: VideoAsset = {
      id: `cam-${Date.now()}`,
      title: `Camera Recording ${new Date().toLocaleTimeString()}`,
      url: recordedUrl,
      duration: Math.max(1, recordDuration),
      width: 1280,
      height: 720,
      sizeBytes: recordedBlob.size,
      isCustomUpload: true,
    };
    onVideoRecorded(newAsset);
    onClose();
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordDuration(0);
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
      videoPreviewRef.current.play().catch(() => {});
    }
  };

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-in fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between text-white z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Record Timer */}
        {isRecording && (
          <div className="flex items-center space-x-2 bg-rose-600/90 px-3 py-1 rounded-full text-xs font-mono font-bold animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>REC {formatTimer(recordDuration)}</span>
          </div>
        )}

        {/* Switch camera */}
        <button
          onClick={toggleFacing}
          disabled={isRecording || !!recordedUrl}
          className="p-2 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white disabled:opacity-40"
          title="Flip Camera (Front/Rear)"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 my-3 rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-800">
        {errorMsg ? (
          <div className="p-6 text-center text-zinc-400 max-w-xs space-y-2">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs">{errorMsg}</p>
            <p className="text-[11px] text-zinc-500">
              Ensure you have granted camera permissions in your browser.
            </p>
          </div>
        ) : recordedUrl ? (
          <video
            src={recordedUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-cover"
          />
        ) : stream ? (
          <video
            ref={videoPreviewRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-zinc-500">
            <Camera className="w-8 h-8 animate-pulse text-indigo-400" />
            <span className="text-xs">Accessing camera...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-around py-3 z-20">
        {recordedUrl ? (
          <>
            <button
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleUseVideo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Use in Editor</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-rose-600 border-4 border-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                title="Stop Recording"
              >
                <Square className="w-6 h-6 fill-white text-white" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!stream}
                className="w-16 h-16 rounded-full bg-white border-4 border-rose-600 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                title="Start Recording"
              >
                <div className="w-11 h-11 rounded-full bg-rose-600" />
              </button>
            )}
            <span className="text-[11px] text-zinc-400 mt-2 font-medium">
              {isRecording ? 'Tap to Stop' : 'Tap to Record Video'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
