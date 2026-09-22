import React from 'react';
import { Gauge, Sparkles, RotateCcw } from 'lucide-react';

interface SpeedToolProps {
  currentSpeed: number;
  originalDuration: number;
  onSelectSpeed: (speed: number) => void;
  onApplySpeed: () => void;
  onReset: () => void;
}

export const SpeedTool: React.FC<SpeedToolProps> = ({
  currentSpeed,
  originalDuration,
  onSelectSpeed,
  onApplySpeed,
  onReset,
}) => {
  const presets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];
  const newDuration = (originalDuration / currentSpeed).toFixed(1);

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Speed Controller</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-zinc-400">Duration:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{newDuration}s</span>
          <span className="text-[11px] font-mono font-bold text-white bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
            {currentSpeed}x
          </span>
        </div>
      </div>

      {/* Speed Presets Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((rate) => {
          const isSelected = currentSpeed === rate;
          return (
            <button
              key={rate}
              onClick={() => onSelectSpeed(rate)}
              className={`py-2 px-1 rounded-xl text-center border transition-all ${
                isSelected
                  ? 'bg-emerald-950 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/20'
                  : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="text-xs">{rate}x</div>
              <div className="text-[9px] text-zinc-500">
                {rate < 1 ? 'Slow' : rate === 1 ? 'Normal' : 'Fast'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continuous Slider */}
      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>Custom Multiplier:</span>
          <span className="font-mono text-emerald-400 font-bold">{currentSpeed}x</span>
        </div>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.05}
          value={currentSpeed}
          onChange={(e) => onSelectSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
          <span>0.25x</span>
          <span>1.0x</span>
          <span>2.0x</span>
          <span>4.0x</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset Speed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-speed"
          onClick={onApplySpeed}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span>Apply Speed & Export</span>
        </button>
      </div>
    </div>
  );
};
