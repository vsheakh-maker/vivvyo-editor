/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Subtitles,
  Plus,
  Trash2,
  Sliders,
  Type,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  AlignVerticalJustifyCenter,
} from 'lucide-react';
import { SubtitleStyleSettings, SubtitleItem } from '../../types.ts';

interface SubtitleToolProps {
  settings: SubtitleStyleSettings;
  onChangeSettings: (settings: SubtitleStyleSettings) => void;
  videoDuration: number;
  currentTime: number;
  onSeek?: (time: number) => void;
  onApply: () => void;
  onReset: () => void;
}

const PRESETS = [
  {
    id: 'hormozi',
    name: 'Hormozi Viral',
    primary: '#ffffff',
    highlight: '#eab308',
    bg: true,
    badge: 'Trending 🔥',
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    primary: '#38bdf8',
    highlight: '#ec4899',
    bg: false,
    badge: 'Glow',
  },
  {
    id: 'minimal',
    name: 'Clean Minimal',
    primary: '#f4f4f5',
    highlight: '#a1a1aa',
    bg: false,
    badge: 'Aesthetic',
  },
  {
    id: 'netflix',
    name: 'Netflix Cinema',
    primary: '#ffffff',
    highlight: '#ffffff',
    bg: true,
    badge: 'Classic',
  },
  {
    id: 'comic',
    name: 'Comic Pop',
    primary: '#fde047',
    highlight: '#f43f5e',
    bg: true,
    badge: 'Fun',
  },
] as const;

export const SubtitleTool: React.FC<SubtitleToolProps> = ({
  settings,
  onChangeSettings,
  videoDuration,
  currentTime,
  onSeek,
  onApply,
  onReset,
}) => {
  const [editingItemText, setEditingItemText] = useState('');

  const addSubtitleAtPlayhead = () => {
    const start = Math.max(0, Math.min(videoDuration - 0.5, currentTime));
    const end = Math.min(videoDuration, start + 2.0);
    const newItem: SubtitleItem = {
      id: `sub-${Date.now()}`,
      text: editingItemText.trim() || 'ADD YOUR CAPTION HERE',
      startTime: parseFloat(start.toFixed(1)),
      endTime: parseFloat(end.toFixed(1)),
    };

    onChangeSettings({
      ...settings,
      enabled: true,
      items: [...settings.items, newItem],
    });
    setEditingItemText('');
  };

  const updateItem = (id: string, patch: Partial<SubtitleItem>) => {
    onChangeSettings({
      ...settings,
      items: settings.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };

  const removeItem = (id: string) => {
    onChangeSettings({
      ...settings,
      items: settings.items.filter((it) => it.id !== id),
    });
  };

  const handleApplyPreset = (preset: typeof PRESETS[number]) => {
    onChangeSettings({
      ...settings,
      enabled: true,
      preset: preset.id,
      primaryColor: preset.primary,
      highlightColor: preset.highlight,
      hasBackground: preset.bg,
    });
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-zinc-950 font-bold shadow">
            <Subtitles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            TikTok Captions & Subtitles
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChangeSettings({ ...settings, enabled: !settings.enabled })}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
              settings.enabled
                ? 'bg-amber-500 border-amber-400 text-zinc-950'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {settings.enabled ? 'Enabled' : 'Hidden'}
          </button>
          <button
            onClick={onReset}
            className="p-1 text-zinc-400 hover:text-white"
            title="Reset subtitles"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Style Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {PRESETS.map((p) => {
          const isSelected = settings.preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold shrink-0 transition-all flex flex-col items-start ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{p.name}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
              </div>
              <span className="text-[9px] font-mono text-zinc-500">{p.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Add at Playhead */}
      <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
        <input
          type="text"
          placeholder={`Enter line at ${currentTime.toFixed(1)}s (e.g. "WAIT TILL THE END 😱")...`}
          value={editingItemText}
          onChange={(e) => setEditingItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addSubtitleAtPlayhead();
          }}
          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none px-1"
        />
        <button
          onClick={addSubtitleAtPlayhead}
          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
        >
          <Plus className="w-3 h-3" />
          <span>Add at {currentTime.toFixed(1)}s</span>
        </button>
      </div>

      {/* List of Subtitle Lines */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {settings.items.length === 0 ? (
          <div className="text-center py-4 text-xs text-zinc-500">
            No subtitles yet. Type above and tap "Add" to drop a caption at the playhead!
          </div>
        ) : (
          settings.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80 text-xs gap-2"
            >
              <button
                onClick={() => onSeek && onSeek(item.startTime)}
                className="w-12 text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 shrink-0 text-center hover:bg-amber-900/60"
                title="Jump playhead to this caption"
              >
                {item.startTime}s
              </button>

              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                className="flex-1 bg-zinc-900/60 text-white rounded px-2 py-0.5 border border-zinc-800 focus:border-amber-500 focus:outline-none text-[11px]"
              />

              <div className="flex items-center gap-1 shrink-0 text-[10px] text-zinc-400">
                <input
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={item.endTime}
                  onChange={(e) =>
                    updateItem(item.id, { endTime: parseFloat(e.target.value) || item.startTime + 1 })
                  }
                  className="w-12 bg-zinc-900 text-zinc-300 text-right font-mono rounded px-1 py-0.5 border border-zinc-800"
                />
                <span>s</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                  title="Delete line"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Positioning and Styling Controls */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800 text-[11px]">
        {/* Position */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Position:</span>
          <div className="flex items-center gap-1">
            {(['bottom', 'middle', 'top'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onChangeSettings({ ...settings, position: pos })}
                className={`px-2 py-0.5 rounded capitalize text-[10px] font-bold ${
                  settings.position === pos
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Size:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min={18}
              max={44}
              value={settings.fontSize}
              onChange={(e) =>
                onChangeSettings({ ...settings, fontSize: parseInt(e.target.value, 10) })
              }
              className="w-16 h-1.5 bg-zinc-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400 text-[10px]">{settings.fontSize}px</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="pt-1">
        <button
          onClick={onApply}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          <span>Burn Captions into Video & Export</span>
        </button>
      </div>
    </div>
  );
};
