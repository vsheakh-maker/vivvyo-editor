import React, { useRef } from 'react';
import { X, Upload, Film, Check, Sparkles, Smartphone, FolderOpen, Video } from 'lucide-react';
import { VideoAsset } from '../types.ts';
import { SAMPLE_VIDEOS } from '../data/sampleMedia.ts';

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideoId: string;
  onSelectVideo: (video: VideoAsset) => void;
  onUploadCustomVideo: (file: File) => void;
}

export const VideoPickerModal: React.FC<VideoPickerModalProps> = ({
  isOpen,
  onClose,
  currentVideoId,
  onSelectVideo,
  onUploadCustomVideo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomVideo(e.target.files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Import Video Source</h3>
              <p className="text-[11px] text-zinc-400">Camera roll, mobile gallery, or sample clips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Device Gallery & Files Import Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-gradient-to-b from-indigo-950/40 to-zinc-950/70 hover:bg-indigo-950/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm active:scale-98"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5 text-indigo-300" />
          </div>
          <span className="text-xs font-bold text-white group-hover:text-indigo-200 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Video from Mobile / Tablet Device</span>
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">
            Tap to open iPhone Photo Library, Android Files, MP4, MOV, WEBM
          </span>
        </div>

        {/* Sample Library */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Or Choose Demo Footage:</span>
            <span className="text-[10px] text-indigo-400 font-semibold">Instant Edit</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SAMPLE_VIDEOS.map((v) => {
              const isSelected = v.id === currentVideoId;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVideo(v);
                    onClose();
                  }}
                  className={`relative text-left rounded-xl overflow-hidden border transition-all flex flex-col ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1 right-1.5 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
                      {v.duration}s
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="p-2 bg-zinc-900">
                    <h4 className="text-[11px] font-bold text-zinc-200 truncate">{v.title}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {v.width}x{v.height}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
