import React from 'react';
import { Scissors, Play, RotateCcw, Check, Sparkles } from 'lucide-react';

interface TrimToolProps {
  duration: number;
  trimRange: [number, number];
  onTrimChange: (range: [number, number]) => void;
  onPreviewTrim: () => void;
  onApplyTrim: () => void;
  onReset: () => void;
}

export const TrimTool: React.FC<TrimToolProps> = ({
  duration,
  trimRange,
  onTrimChange,
  onPreviewTrim,
  onApplyTrim,
  onReset,
}) => {
  const [start, end] = trimRange;
  const clipDuration = Math.max(0, end - start);

  const formatSec = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Math.min(parseFloat(e.target.value), end - 0.5);
    onTrimChange([Math.max(0, newStart), end]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = Math.max(parseFloat(e.target.value), start + 0.5);
    onTrimChange([start, Math.min(duration, newEnd)]);
  };

  const setPreset = (preset: 'first-half' | 'second-half' | 'middle-5s' | 'all') => {
    if (preset === 'all') onTrimChange([0, duration]);
    else if (preset === 'first-half') onTrimChange([0, duration / 2]);
    else if (preset === 'second-half') onTrimChange([duration / 2, duration]);
    else if (preset === 'middle-5s') {
      const mid = duration / 2;
      onTrimChange([Math.max(0, mid - 2.5), Math.min(duration, mid + 2.5)]);
    }
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-4">
      {/* Title & Duration readout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scissors className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Trim & Cut</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
          <span className="text-[10px] text-zinc-400">Clip Length:</span>
          <span className="text-xs font-mono font-bold text-amber-400">{formatSec(clipDuration)}</span>
        </div>
      </div>

      {/* Dual Handle Scrubber */}
      <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/70">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>Start: <strong className="text-white">{formatSec(start)}</strong></span>
          <span>End: <strong className="text-white">{formatSec(end)}</strong></span>
        </div>

        {/* Range Sliders */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 w-8">IN</span>
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.1}
              value={start}
              onChange={handleStartChange}
              className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 w-8">OUT</span>
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.1}
              value={end}
              onChange={handleEndChange}
              className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setPreset('all')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Entire Video
          </button>
          <button
            onClick={() => setPreset('first-half')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            First Half
          </button>
          <button
            onClick={() => setPreset('second-half')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Second Half
          </button>
          <button
            onClick={() => setPreset('middle-5s')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Middle 5s
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onPreviewTrim}
          className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Loop Clip</span>
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-trim"
          onClick={onApplyTrim}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Cut & Export</span>
        </button>
      </div>
    </div>
  );
};
