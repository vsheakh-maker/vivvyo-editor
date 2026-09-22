import React from 'react';
import {
  Crop,
  Smartphone,
  Square,
  Tv,
  Tablet,
  Sparkles,
  RotateCcw,
  Sliders,
  Maximize2,
  Film,
} from 'lucide-react';
import { AspectRatioType, CustomCropSettings, CanvasBackgroundType } from '../../types.ts';
import { ASPECT_RATIOS } from '../../data/sampleMedia.ts';

interface CropToolProps {
  currentRatio: AspectRatioType;
  customCrop: CustomCropSettings;
  canvasBackground?: CanvasBackgroundType;
  onSelectRatio: (ratio: AspectRatioType) => void;
  onSelectCanvasBackground?: (bg: CanvasBackgroundType) => void;
  onUpdateCustomCrop: (settings: CustomCropSettings) => void;
  onApplyCrop: () => void;
  onReset: () => void;
}

export const CropTool: React.FC<CropToolProps> = ({
  currentRatio,
  customCrop,
  canvasBackground = 'black',
  onSelectRatio,
  onSelectCanvasBackground,
  onUpdateCustomCrop,
  onApplyCrop,
  onReset,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Square':
        return <Square className="w-4 h-4" />;
      case 'Tv':
        return <Tv className="w-4 h-4" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Crop className="w-4 h-4" />;
    }
  };

  const CUSTOM_RATIO_PRESETS = [
    { label: '21:9 Cinematic UltraWide', w: 21, h: 9 },
    { label: '2.39:1 Anamorphic Cinema', w: 2.39, h: 1 },
    { label: '16:10 Tablet / Laptop', w: 16, h: 10 },
    { label: '3:2 Mirrorless Camera', w: 3, h: 2 },
    { label: '5:4 Classic Portrait', w: 5, h: 4 },
  ];

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crop className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Crop Aspect Ratio</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 uppercase">
          {currentRatio === 'custom'
            ? `${customCrop.widthRatio}:${customCrop.heightRatio} Custom`
            : currentRatio}
        </span>
      </div>

      {/* Aspect Ratio Cards Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {ASPECT_RATIOS.map((opt) => {
          const isSelected = currentRatio === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectRatio(opt.id)}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between ${
                isSelected
                  ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                  : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className={isSelected ? 'text-indigo-400 mb-1' : 'text-zinc-500 mb-1'}>
                {getIcon(opt.iconName)}
              </div>
              <span className="text-[11px] font-bold">{opt.label}</span>
              <span className="text-[8px] text-zinc-500 truncate w-full">{opt.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Crop Controls (shown when Custom is selected) */}
      {currentRatio === 'custom' && (
        <div className="bg-zinc-950 p-3 rounded-2xl border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Custom Aspect Ratio Tuner</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              Ratio: {(customCrop.widthRatio / customCrop.heightRatio).toFixed(2)} : 1
            </span>
          </div>

          {/* Preset quick buttons */}
          <div className="flex flex-wrap gap-1.5">
            {CUSTOM_RATIO_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() =>
                  onUpdateCustomCrop({
                    widthRatio: p.w,
                    heightRatio: p.h,
                    freeform: false,
                  })
                }
                className={`text-[9px] px-2 py-1 rounded-lg border transition-all font-medium ${
                  customCrop.widthRatio === p.w && customCrop.heightRatio === p.h
                    ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Width and Height Ratio Sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Width Unit</span>
                <span className="font-mono text-indigo-400 font-bold">{customCrop.widthRatio}</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={customCrop.widthRatio}
                onChange={(e) =>
                  onUpdateCustomCrop({
                    ...customCrop,
                    widthRatio: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Height Unit</span>
                <span className="font-mono text-indigo-400 font-bold">{customCrop.heightRatio}</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={customCrop.heightRatio}
                onChange={(e) =>
                  onUpdateCustomCrop({
                    ...customCrop,
                    heightRatio: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Canvas Backdrop Ambience Style (Letterbox/Fill) */}
      {onSelectCanvasBackground && (
        <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Canvas Backdrop Ambience:</span>
            <span className="capitalize font-mono text-indigo-400 text-[10px]">
              {canvasBackground.replace('-', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'black', label: 'Black', style: 'bg-black border-zinc-700' },
              { id: 'blur', label: 'Video Blur', style: 'bg-indigo-950/60 border-indigo-500/50' },
              { id: 'gradient-indigo', label: 'Neon Blue', style: 'bg-gradient-to-r from-blue-900 to-indigo-900 border-indigo-400/40' },
              { id: 'gradient-sunset', label: 'Sunset', style: 'bg-gradient-to-r from-rose-900 to-amber-900 border-rose-400/40' },
              { id: 'grid', label: 'Studio Grid', style: 'bg-zinc-950 border-zinc-700' },
            ].map((bgOption) => (
              <button
                key={bgOption.id}
                type="button"
                onClick={() => onSelectCanvasBackground(bgOption.id as CanvasBackgroundType)}
                className={`py-1 px-1.5 rounded-lg border text-[10px] font-medium truncate text-center transition-all ${
                  canvasBackground === bgOption.id
                    ? 'ring-2 ring-indigo-500 border-indigo-400 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                } ${bgOption.style}`}
              >
                {bgOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset to Original"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-crop"
          onClick={onApplyCrop}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Apply Crop & Export</span>
        </button>
      </div>
    </div>
  );
};
