import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  X,
  FolderCheck,
  Sparkles,
  Loader2,
  HardDrive,
  Settings2,
  Zap,
  Film,
} from 'lucide-react';
import { ExportResult } from '../utils/videoProcessor.ts';
import { OutputFormat, ExportConfig } from '../types.ts';

interface ExportProgressModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  progress: number;
  result: ExportResult | null;
  toolTitle: string;
  duration: number;
  initialFormat?: OutputFormat;
  onClose: () => void;
  onOpenStudio: () => void;
  onStartExport: (config: ExportConfig) => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  isProcessing,
  progress,
  result,
  toolTitle,
  duration,
  initialFormat = 'mp4',
  onClose,
  onOpenStudio,
  onStartExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(initialFormat);
  const [autoCompress, setAutoCompress] = useState<boolean>(true);
  const [resolution, setResolution] = useState<'1080p' | '720p' | '480p'>('720p');
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');

  if (!isOpen) return null;

  // Estimate file size based on settings and duration
  const bitrates = {
    '1080p': autoCompress ? 3.0 : 6.0,
    '720p': autoCompress ? 1.8 : 3.5,
    '480p': autoCompress ? 0.9 : 1.8,
  };
  const estMbps = bitrates[resolution] || 2.0;
  const estBytes = (duration * (estMbps * 1000000)) / 8;
  const estMb = (estBytes / (1024 * 1024)).toFixed(1);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.blobUrl;
    const ext = result.format || (result.mimeType.includes('mp4') ? 'mp4' : 'webm');
    a.download = `Vivvyo_${toolTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const handleTriggerStart = () => {
    onStartExport({
      format: selectedFormat,
      autoCompress,
      resolution,
      fps,
      quality,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : result ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-indigo-500/50 shadow-sm bg-black">
                <img
                  src="/c9724d06-0f9a-4cc7-9de1-4265d250e58f.png"
                  alt="Vivvyo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-white">
                {isProcessing
                  ? `Encoding ${selectedFormat.toUpperCase()} Video...`
                  : result
                  ? 'Export Complete!'
                  : 'Export Settings'}
              </h3>
              {!isProcessing && !result && (
                <p className="text-[10px] text-zinc-400">Choose format & compression options</p>
              )}
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Phase 1: Configuration (before processing) */}
        {!isProcessing && !result && (
          <div className="space-y-3.5 pt-1">
            {/* Output Format Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-300">Target Video Format:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'mp4', label: 'MP4', sub: 'Most Compatible' },
                  { id: 'mov', label: 'MOV', sub: 'Apple / QuickTime' },
                  { id: 'webm', label: 'WEBM', sub: 'Android / Web' },
                ].map((fmt) => {
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id as OutputFormat)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-950 to-purple-950 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/30 shadow-md'
                          : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase">{fmt.label}</div>
                      <div className="text-[8px] text-zinc-500 mt-0.5">{fmt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Compress Switch */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[200px]">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Auto Compress Video</span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Reduces file size by up to 70% with intelligent bitrate encoding
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoCompress(!autoCompress)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  autoCompress ? 'bg-indigo-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoCompress ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Resolution & FPS */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Resolution:</span>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl p-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="1080p">1080p FHD (1920x1080)</option>
                  <option value="720p">720p HD (1280x720)</option>
                  <option value="480p">480p SD (Mobile)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Frame Rate:</span>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value) as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl p-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value={60}>60 FPS (Smooth)</option>
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={24}>24 FPS (Cinematic)</option>
                </select>
              </div>
            </div>

            {/* Estimated Size Card */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-zinc-400">Est. Size:</span>
                <strong className="text-emerald-400 font-mono">~{estMb} MB</strong>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 uppercase">
                {selectedFormat} • {resolution}
              </span>
            </div>

            {/* Start Export Button */}
            <button
              id="btn-confirm-export"
              onClick={handleTriggerStart}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span>Export {selectedFormat.toUpperCase()} Video</span>
            </button>
          </div>
        )}

        {/* Phase 2: Processing State */}
        {isProcessing && (
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>
                {autoCompress ? 'Compressing & Encoding...' : 'Rendering Frames...'}
              </span>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              Target: {selectedFormat.toUpperCase()} • {resolution} • {autoCompress ? 'Compressed' : 'Standard'}
            </p>
          </div>
        )}

        {/* Phase 3: Success / Finished State */}
        {!isProcessing && result && (
          <div className="space-y-3">
            {/* Exported Video Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800">
              <video
                src={result.blobUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details pills */}
            <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px]">
              <div>
                <span className="text-zinc-400">Duration: </span>
                <strong className="text-white font-mono">{result.duration.toFixed(1)}s</strong>
              </div>
              <div>
                <span className="text-zinc-400">Size: </span>
                <strong className="text-emerald-400 font-mono">{formatSize(result.sizeBytes)}</strong>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 uppercase">
                {result.format || selectedFormat}
              </span>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save / Download .{result.format || selectedFormat} Video</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenStudio();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <FolderCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View in My Studio</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
