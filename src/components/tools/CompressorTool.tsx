import React from 'react';
import { Archive, Sparkles, Check, HardDrive } from 'lucide-react';
import { CompressionSettings } from '../../types.ts';

interface CompressorToolProps {
  settings: CompressionSettings;
  duration: number;
  originalSizeBytes?: number;
  onChangeSettings: (settings: CompressionSettings) => void;
  onApplyCompress: () => void;
}

export const CompressorTool: React.FC<CompressorToolProps> = ({
  settings,
  duration,
  originalSizeBytes,
  onChangeSettings,
  onApplyCompress,
}) => {
  // Estimate output size
  let estimatedBitrateMbps = 2.5;
  if (settings.targetResolution === '1080p') {
    estimatedBitrateMbps = settings.quality === 'high' ? 5.0 : settings.quality === 'medium' ? 3.5 : 2.0;
  } else if (settings.targetResolution === '720p') {
    estimatedBitrateMbps = settings.quality === 'high' ? 3.2 : settings.quality === 'medium' ? 2.2 : 1.4;
  } else if (settings.targetResolution === '480p') {
    estimatedBitrateMbps = settings.quality === 'high' ? 1.8 : settings.quality === 'medium' ? 1.2 : 0.8;
  } else {
    estimatedBitrateMbps = settings.quality === 'high' ? 1.0 : settings.quality === 'medium' ? 0.7 : 0.45;
  }

  const estimatedSizeBytes = (duration * (estimatedBitrateMbps * 1000000)) / 8;
  const estimatedMb = (estimatedSizeBytes / (1024 * 1024)).toFixed(1);

  const resolutions: Array<CompressionSettings['targetResolution']> = [
    '1080p',
    '720p',
    '480p',
    '360p',
  ];

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Archive className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Video Compressor</span>
        </div>
        <span className="text-[11px] font-mono text-orange-400 bg-orange-950 px-2 py-0.5 rounded border border-orange-800/80">
          Est. ~{estimatedMb} MB
        </span>
      </div>

      {/* Target Resolution */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400">Target Output Resolution:</span>
        <div className="grid grid-cols-4 gap-1.5">
          {resolutions.map((res) => {
            const isSelected = settings.targetResolution === res;
            return (
              <button
                key={res}
                onClick={() => onChangeSettings({ ...settings, targetResolution: res })}
                className={`py-2 px-1 rounded-xl text-center border transition-all ${
                  isSelected
                    ? 'bg-orange-950 border-orange-500 text-white font-bold ring-2 ring-orange-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="text-xs">{res}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Profile */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400">Compression Profile:</span>
        <div className="grid grid-cols-3 gap-1.5">
          {(['high', 'medium', 'low'] as const).map((q) => {
            const isSelected = settings.quality === q;
            return (
              <button
                key={q}
                onClick={() => onChangeSettings({ ...settings, quality: q })}
                className={`py-2 px-2 rounded-xl text-left border transition-all capitalize ${
                  isSelected
                    ? 'bg-orange-950 border-orange-500 text-white font-semibold ring-2 ring-orange-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="text-xs">{q === 'low' ? 'Max Savings' : q === 'medium' ? 'Balanced' : 'High Quality'}</div>
                <div className="text-[9px] text-zinc-500">
                  {q === 'low' ? 'Smallest file' : q === 'medium' ? 'Best for web' : 'Crisp detail'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estimation Banner */}
      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-orange-400" />
          <div className="text-[11px]">
            <span className="text-zinc-400">Estimated Export Size: </span>
            <strong className="text-white font-mono">~{estimatedMb} MB</strong>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          Save Up to 70%
        </span>
      </div>

      {/* Actions */}
      <div className="pt-1">
        <button
          id="btn-apply-compress"
          onClick={onApplyCompress}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Compress & Export Video</span>
        </button>
      </div>
    </div>
  );
};
