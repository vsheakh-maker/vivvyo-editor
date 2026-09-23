/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smile,
  Plus,
  Trash2,
  Sliders,
  RotateCw,
  Sparkles,
  RotateCcw,
  Move,
  Flame,
  Check,
} from 'lucide-react';
import { StickerOverlayItem } from '../../types.ts';

interface StickersToolProps {
  stickers: StickerOverlayItem[];
  onChangeStickers: (stickers: StickerOverlayItem[]) => void;
  onApply: () => void;
  onReset: () => void;
}

const STICKER_LIBRARY = [
  // Viral TikTok Badges
  { content: '🔥 VIRAL', type: 'badge', label: 'Viral' },
  { content: '🔊 SOUND ON', type: 'badge', label: 'Sound On' },
  { content: '👉 TAP HERE', type: 'badge', label: 'Tap Here' },
  { content: '👀 WAIT FOR IT', type: 'badge', label: 'Wait For It' },
  { content: '❤️ LIKE & FOLLOW', type: 'badge', label: 'Like' },
  { content: '⭐ 100%', type: 'badge', label: '100%' },
  { content: '👑 TOP CREATOR', type: 'badge', label: 'Creator' },
  { content: '⚠️ POV', type: 'badge', label: 'POV' },

  // Emojis & Reactions
  { content: '🔥', type: 'emoji', label: 'Fire' },
  { content: '💀', type: 'emoji', label: 'Skull' },
  { content: '😂', type: 'emoji', label: 'Joy' },
  { content: '🤯', type: 'emoji', label: 'Mind Blown' },
  { content: '✨', type: 'emoji', label: 'Sparkles' },
  { content: '💯', type: 'emoji', label: '100' },
  { content: '🚀', type: 'emoji', label: 'Rocket' },
  { content: '🎯', type: 'emoji', label: 'Target' },
  { content: '😍', type: 'emoji', label: 'Heart Eyes' },
  { content: '⚡', type: 'emoji', label: 'Lightning' },
  { content: '🍿', type: 'emoji', label: 'Popcorn' },
  { content: '🏆', type: 'emoji', label: 'Trophy' },
] as const;

export const StickersTool: React.FC<StickersToolProps> = ({
  stickers,
  onChangeStickers,
  onApply,
  onReset,
}) => {
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    stickers.length > 0 ? stickers[0].id : null
  );

  const activeSticker = stickers.find((s) => s.id === selectedStickerId) || stickers[0];

  const addSticker = (item: typeof STICKER_LIBRARY[number]) => {
    const newSticker: StickerOverlayItem = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content: item.content,
      type: item.type as any,
      x: 50,
      y: 50,
      size: item.type === 'badge' ? 28 : 42,
      rotation: 0,
      animation: 'none',
    };
    const updated = [...stickers, newSticker];
    onChangeStickers(updated);
    setSelectedStickerId(newSticker.id);
  };

  const updateActiveSticker = (patch: Partial<StickerOverlayItem>) => {
    if (!activeSticker) return;
    onChangeStickers(
      stickers.map((s) => (s.id === activeSticker.id ? { ...s, ...patch } : s))
    );
  };

  const removeActiveSticker = () => {
    if (!activeSticker) return;
    const updated = stickers.filter((s) => s.id !== activeSticker.id);
    onChangeStickers(updated);
    setSelectedStickerId(updated.length > 0 ? updated[0].id : null);
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow">
            <Smile className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Stickers, Badges & Reactions
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-800/80">
            {stickers.length} Active
          </span>
          <button
            onClick={onReset}
            className="p-1 text-zinc-400 hover:text-white"
            title="Clear all stickers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Add Library */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400 font-medium">Tap to Add Viral Stickers:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STICKER_LIBRARY.map((item, idx) => (
            <button
              key={idx}
              onClick={() => addSticker(item)}
              className={`px-2.5 py-1 rounded-xl border shrink-0 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all ${
                item.type === 'badge'
                  ? 'bg-gradient-to-r from-pink-600/80 to-purple-600/80 border-pink-500/60 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700'
              }`}
            >
              <span>{item.content}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Stickers Carousel / Selectors */}
      {stickers.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[10px] text-zinc-400 shrink-0">Layers:</span>
          {stickers.map((s, idx) => {
            const isSelected = activeSticker?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStickerId(s.id)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 transition-all ${
                  isSelected
                    ? 'bg-pink-600 border-pink-400 text-white ring-1 ring-pink-500'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                #{idx + 1} {s.content}
              </button>
            );
          })}
        </div>
      )}

      {/* Sticker Adjuster Panel */}
      {activeSticker && (
        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1">
              <Move className="w-3 h-3 text-pink-400" />
              Adjusting: {activeSticker.content}
            </span>
            <button
              onClick={removeActiveSticker}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Position X */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Position X:</span>
              <input
                type="range"
                min={5}
                max={95}
                value={activeSticker.x}
                onChange={(e) => updateActiveSticker({ x: parseInt(e.target.value, 10) })}
                className="w-20 h-1.5 bg-zinc-800 rounded appearance-none accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Position Y */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Position Y:</span>
              <input
                type="range"
                min={5}
                max={95}
                value={activeSticker.y}
                onChange={(e) => updateActiveSticker({ y: parseInt(e.target.value, 10) })}
                className="w-20 h-1.5 bg-zinc-800 rounded appearance-none accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Size */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Scale:</span>
              <input
                type="range"
                min={16}
                max={72}
                value={activeSticker.size}
                onChange={(e) => updateActiveSticker({ size: parseInt(e.target.value, 10) })}
                className="w-20 h-1.5 bg-zinc-800 rounded appearance-none accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Rotation */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Tilt:</span>
              <input
                type="range"
                min={-45}
                max={45}
                value={activeSticker.rotation}
                onChange={(e) => updateActiveSticker({ rotation: parseInt(e.target.value, 10) })}
                className="w-20 h-1.5 bg-zinc-800 rounded appearance-none accent-pink-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Animation FX */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
            <span className="text-zinc-400">Motion FX:</span>
            <div className="flex items-center gap-1">
              {(['none', 'pulse', 'bounce', 'spin'] as const).map((anim) => (
                <button
                  key={anim}
                  onClick={() => updateActiveSticker({ animation: anim })}
                  className={`px-2 py-0.5 rounded capitalize text-[10px] font-bold ${
                    activeSticker.animation === anim
                      ? 'bg-pink-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {anim}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="pt-1">
        <button
          onClick={onApply}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply Stickers to Video & Export</span>
        </button>
      </div>
    </div>
  );
};
