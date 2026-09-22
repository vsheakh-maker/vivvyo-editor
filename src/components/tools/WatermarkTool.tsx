import React from 'react';
import { Type, Sparkles, RotateCcw } from 'lucide-react';
import { WatermarkSettings } from '../../types.ts';

interface WatermarkToolProps {
  watermark: WatermarkSettings;
  onChangeWatermark: (w: WatermarkSettings) => void;
  onApplyWatermark: () => void;
  onReset: () => void;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({
  watermark,
  onChangeWatermark,
  onApplyWatermark,
  onReset,
}) => {
  const positions: Array<WatermarkSettings['position']> = [
    'top-left',
    'top-right',
    'center',
    'bottom-left',
    'bottom-right',
  ];

  const colors = [
    '#ffffff',
    '#000000',
    '#facc15', // yellow
    '#38bdf8', // cyan
    '#f43f5e', // rose
    '#a855f7', // purple
    '#4ade80', // green
  ];

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Watermark & Text</span>
        </div>
        <span className="text-[11px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/80">
          Overlay
        </span>
      </div>

      {/* Text Input */}
      <div className="space-y-1">
        <span className="text-[11px] text-zinc-400">Watermark Text:</span>
        <input
          type="text"
          placeholder="e.g. @MyChannel or Shot on Pro"
          value={watermark.text}
          onChange={(e) => onChangeWatermark({ ...watermark, text: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Position selector */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400">Position Placement:</span>
        <div className="grid grid-cols-5 gap-1">
          {positions.map((pos) => {
            const isSelected = watermark.position === pos;
            return (
              <button
                key={pos}
                onClick={() => onChangeWatermark({ ...watermark, position: pos })}
                className={`py-1.5 px-1 rounded-lg text-center border text-[10px] capitalize transition-all ${
                  isSelected
                    ? 'bg-teal-950 border-teal-500 text-white font-bold ring-2 ring-teal-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                }`}
              >
                {pos.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors & Options */}
      <div className="flex items-center justify-between gap-2">
        {/* Color swatches */}
        <div className="flex items-center space-x-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onChangeWatermark({ ...watermark, color: c })}
              className={`w-6 h-6 rounded-full border transition-all ${
                watermark.color === c ? 'scale-110 ring-2 ring-teal-400' : 'opacity-80'
              }`}
              style={{ backgroundColor: c, borderColor: '#52525b' }}
            />
          ))}
        </div>

        {/* Badge toggle */}
        <button
          onClick={() => onChangeWatermark({ ...watermark, hasBackground: !watermark.hasBackground })}
          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
            watermark.hasBackground
              ? 'bg-teal-950 border-teal-500 text-teal-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          {watermark.hasBackground ? 'Badge ON' : 'Badge OFF'}
        </button>
      </div>

      {/* Opacity Slider */}
      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-1">
        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>Opacity:</span>
          <span className="font-mono text-teal-400">{Math.round(watermark.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={watermark.opacity}
          onChange={(e) => onChangeWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-teal-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Clear Watermark"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-watermark"
          onClick={onApplyWatermark}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-200" />
          <span>Apply Watermark & Export</span>
        </button>
      </div>
    </div>
  );
};
