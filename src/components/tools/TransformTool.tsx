import React from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Sparkles } from 'lucide-react';
import { TransformSettings } from '../../types.ts';

interface TransformToolProps {
  transform: TransformSettings;
  onChangeTransform: (t: TransformSettings) => void;
  onApplyTransform: () => void;
  onReset: () => void;
}

export const TransformTool: React.FC<TransformToolProps> = ({
  transform,
  onChangeTransform,
  onApplyTransform,
  onReset,
}) => {
  const rotateClockwise = () => {
    onChangeTransform({
      ...transform,
      rotation: (transform.rotation + 90) % 360,
    });
  };

  const rotateCounterClockwise = () => {
    onChangeTransform({
      ...transform,
      rotation: (transform.rotation + 270) % 360,
    });
  };

  const toggleFlipH = () => {
    onChangeTransform({
      ...transform,
      flipHorizontal: !transform.flipHorizontal,
    });
  };

  const toggleFlipV = () => {
    onChangeTransform({
      ...transform,
      flipVertical: !transform.flipVertical,
    });
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RotateCw className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Rotate & Mirror</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/80">
          <span>{transform.rotation}°</span>
          {transform.flipHorizontal && <span>• FLIP-H</span>}
          {transform.flipVertical && <span>• FLIP-V</span>}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={rotateClockwise}
          className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <RotateCw className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold">Rotate 90° CW</span>
        </button>

        <button
          onClick={rotateCounterClockwise}
          className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold">Rotate 90° CCW</span>
        </button>

        <button
          onClick={toggleFlipH}
          className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all active:scale-95 ${
            transform.flipHorizontal
              ? 'bg-blue-950 border-blue-500 text-white ring-2 ring-blue-500/20'
              : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
          }`}
        >
          <FlipHorizontal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold">Flip Horizontal (Selfie)</span>
        </button>

        <button
          onClick={toggleFlipV}
          className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all active:scale-95 ${
            transform.flipVertical
              ? 'bg-blue-950 border-blue-500 text-white ring-2 ring-blue-500/20'
              : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
          }`}
        >
          <FlipVertical className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold">Flip Vertical</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset Transforms"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-transform"
          onClick={onApplyTransform}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Apply & Export Video</span>
        </button>
      </div>
    </div>
  );
};
