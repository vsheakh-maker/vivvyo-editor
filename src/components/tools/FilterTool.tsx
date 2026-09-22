import React, { useState } from 'react';
import { Sparkles, Sliders, RotateCcw } from 'lucide-react';
import { FilterType } from '../../types.ts';
import { FILTER_PRESETS } from '../../data/sampleMedia.ts';

interface FilterToolProps {
  currentFilter: FilterType;
  onSelectFilter: (filterId: FilterType, cssFilter: string) => void;
  onApplyFilter: () => void;
  onReset: () => void;
}

export const FilterTool: React.FC<FilterToolProps> = ({
  currentFilter,
  onSelectFilter,
  onApplyFilter,
  onReset,
}) => {
  const [intensity, setIntensity] = useState(100);

  const handleSelect = (preset: typeof FILTER_PRESETS[0]) => {
    onSelectFilter(preset.id, preset.cssFilter);
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Cinematic Filters</span>
        </div>
        <span className="text-[11px] font-mono text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-800/60 uppercase">
          {currentFilter}
        </span>
      </div>

      {/* Filter Horizontal Scroll / Grid */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-700">
        {FILTER_PRESETS.map((preset) => {
          const isSelected = currentFilter === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`shrink-0 w-20 flex flex-col items-center p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-zinc-800 border-pink-500 ring-2 ring-pink-500/20 text-white'
                  : 'bg-zinc-950 hover:bg-zinc-800/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Filter swatch bubble */}
              <div
                className={`w-10 h-10 rounded-full mb-1.5 flex items-center justify-center border border-white/20 shadow-inner ${preset.badgeColor}`}
                style={{ filter: preset.cssFilter }}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow" />}
              </div>
              <span className="text-[10px] font-semibold truncate w-full text-center">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Intensity slider */}
      {currentFilter !== 'none' && (
        <div className="flex items-center space-x-3 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800/80">
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400">Intensity:</span>
          <input
            type="range"
            min={10}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
            className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-[11px] font-mono text-pink-400 w-8 text-right">{intensity}%</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-filter"
          onClick={onApplyFilter}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-200" />
          <span>Apply Filter & Export</span>
        </button>
      </div>
    </div>
  );
};
