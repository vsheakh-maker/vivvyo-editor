import React, { useState } from 'react';
import { FileAudio, Play, Pause, Download, Sparkles, Check, Music } from 'lucide-react';
import { extractAudioFromVideo } from '../../utils/videoProcessor.ts';

interface ExtractAudioToolProps {
  videoUrl: string;
  videoTitle: string;
  duration: number;
  onAudioExtracted: (blob: Blob, url: string, duration: number) => void;
}

export const ExtractAudioTool: React.FC<ExtractAudioToolProps> = ({
  videoUrl,
  videoTitle,
  duration,
  onAudioExtracted,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      setProgress(10);
      const res = await extractAudioFromVideo(videoUrl, (pct) => setProgress(pct));
      setExtractedUrl(res.blobUrl);
      const audio = new Audio(res.blobUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioObj(audio);
      onAudioExtracted(res.blob, res.blobUrl, res.duration);
    } catch (err) {
      console.error('Audio extraction error', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioObj) return;
    if (isPlaying) {
      audioObj.pause();
      setIsPlaying(false);
    } else {
      audioObj.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!extractedUrl) return;
    const a = document.createElement('a');
    a.href = extractedUrl;
    a.download = `${videoTitle.replace(/\s+/g, '_')}_audio.wav`;
    a.click();
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileAudio className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Video to Audio / MP3</span>
        </div>
        <span className="text-[11px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/80">
          WAV (Lossless)
        </span>
      </div>

      {/* Extraction Card */}
      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Music className="w-5 h-5" />
          </div>
          <div className="flex-1 truncate">
            <h4 className="text-xs font-bold text-zinc-100 truncate">{videoTitle} Audio Track</h4>
            <p className="text-[10px] text-zinc-400">Duration: ~{Math.round(duration)} seconds • Stereo 44.1kHz</p>
          </div>
        </div>

        {/* Simulated Waveform Visualizer */}
        <div className="h-10 bg-zinc-900 rounded-lg p-2 flex items-center justify-between gap-1 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const h = Math.sin(i * 0.4) * 14 + 16;
            return (
              <div
                key={i}
                className="w-1.5 rounded-full bg-rose-500/70"
                style={{
                  height: `${h}px`,
                  opacity: extractedUrl ? (isPlaying ? 0.9 : 0.6) : 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Status / Player if already extracted */}
        {extractedUrl && (
          <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
            <button
              onClick={handleTogglePlay}
              className="flex items-center space-x-2 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Audio' : 'Preview Extracted Audio'}</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Ready
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-1">
        {extractedUrl ? (
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Extracted Audio (.WAV)</span>
          </button>
        ) : (
          <button
            id="btn-extract-audio"
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>{isExtracting ? `Extracting Audio (${progress}%)...` : 'Extract Audio from Video'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
