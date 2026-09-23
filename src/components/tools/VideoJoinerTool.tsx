/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Zap,
  Sliders,
  ChevronDown,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VideoAsset, TransitionSettings, TransitionType } from '../../types.ts';
import { SAMPLE_VIDEOS } from '../../data/sampleMedia.ts';
import { playTransitionSoundFx } from '../../utils/audioSynth.ts';

interface VideoJoinerToolProps {
  currentVideo: VideoAsset;
  onJoinVideos: (clips: VideoAsset[], transitions: TransitionSettings[]) => void;
  onOpenTransitionTool?: () => void;
}

const QUICK_TRANSITIONS: { id: TransitionType; label: string; icon: string }[] = [
  { id: 'cross-dissolve', label: 'Dissolve', icon: '✨' },
  { id: 'fade-black', label: 'Fade Black', icon: '🌑' },
  { id: 'fade-white', label: 'Flash White', icon: '⚡' },
  { id: 'zoom-in', label: 'Zoom In', icon: '🔍' },
  { id: 'slide-left', label: 'Slide Left', icon: '⬅️' },
  { id: 'blur-dissolve', label: 'Blur', icon: '💧' },
  { id: 'glitch', label: 'Glitch', icon: '👾' },
];

export const VideoJoinerTool: React.FC<VideoJoinerToolProps> = ({
  currentVideo,
  onJoinVideos,
  onOpenTransitionTool,
}) => {
  const [selectedClips, setSelectedClips] = useState<VideoAsset[]>([
    currentVideo,
    SAMPLE_VIDEOS.find((v) => v.id !== currentVideo.id) || SAMPLE_VIDEOS[0],
  ]);

  // Transitions between clips: index i is transition between selectedClips[i] and selectedClips[i+1]
  const [transitions, setTransitions] = useState<TransitionSettings[]>([
    { type: 'cross-dissolve', duration: 0.8, easing: 'ease-in-out', soundFx: 'whoosh' },
  ]);

  // Which transition index is currently being edited in popover
  const [editingTransitionIdx, setEditingTransitionIdx] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const clipsCopy = [...selectedClips];
    const item = clipsCopy.splice(index, 1)[0];
    clipsCopy.splice(index - 1, 0, item);
    setSelectedClips(clipsCopy);

    // Maintain transition array length
    ensureTransitionsCount(clipsCopy.length);
  };

  const moveDown = (index: number) => {
    if (index === selectedClips.length - 1) return;
    const clipsCopy = [...selectedClips];
    const item = clipsCopy.splice(index, 1)[0];
    clipsCopy.splice(index + 1, 0, item);
    setSelectedClips(clipsCopy);

    ensureTransitionsCount(clipsCopy.length);
  };

  const removeClip = (index: number) => {
    if (selectedClips.length <= 2) return;
    const updated = selectedClips.filter((_, i) => i !== index);
    setSelectedClips(updated);
    ensureTransitionsCount(updated.length);
    if (editingTransitionIdx !== null && editingTransitionIdx >= updated.length - 1) {
      setEditingTransitionIdx(null);
    }
  };

  const addClip = (video: VideoAsset) => {
    const updated = [...selectedClips, video];
    setSelectedClips(updated);
    ensureTransitionsCount(updated.length);
  };

  const ensureTransitionsCount = (clipCount: number) => {
    const needed = Math.max(0, clipCount - 1);
    setTransitions((prev) => {
      const copy = [...prev];
      while (copy.length < needed) {
        copy.push({ type: 'cross-dissolve', duration: 0.8, easing: 'ease-in-out', soundFx: 'whoosh' });
      }
      return copy.slice(0, needed);
    });
  };

  const updateTransition = (idx: number, patch: Partial<TransitionSettings>) => {
    setTransitions((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], ...patch };
      }
      return copy;
    });
  };

  const applyGlobalTransition = (type: TransitionType) => {
    setTransitions((prev) =>
      prev.map((t) => ({ ...t, type }))
    );
    playTransitionSoundFx('whoosh', 0.5);
  };

  // Estimate total duration minus overlaps
  const totalDuration = selectedClips.reduce((acc, c) => acc + c.duration, 0);
  const transitionOverlap = transitions.reduce((acc, t) => acc + t.duration * 0.5, 0);
  const netDuration = Math.max(1, totalDuration - transitionOverlap);

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-3.5 space-y-3">
      {/* Header with sequence meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Video Joiner & Timeline</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenTransitionTool && (
            <button
              onClick={onOpenTransitionTool}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 border border-indigo-800/60 px-2 py-1 rounded-lg"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Transition FX</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
            <span>{selectedClips.length} Clips</span>
            <span>•</span>
            <span>~{Math.round(netDuration)}s</span>
          </div>
        </div>
      </div>

      {/* Global Quick Transition Bar */}
      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/70 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-zinc-400 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Apply Transition to All:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {QUICK_TRANSITIONS.map((qt) => (
            <button
              key={qt.id}
              onClick={() => applyGlobalTransition(qt.id)}
              className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium shrink-0 flex items-center gap-1"
              title={`Set all transitions to ${qt.label}`}
            >
              <span>{qt.icon}</span>
              <span>{qt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Sequence with Transition Connectors */}
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {selectedClips.map((clip, idx) => {
          const trans = transitions[idx];

          return (
            <React.Fragment key={`${clip.id}-${idx}`}>
              {/* Clip Card */}
              <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-xs hover:border-zinc-700 transition-colors">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="truncate font-semibold text-zinc-200">{clip.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">{clip.duration}s</span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move clip up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === selectedClips.length - 1}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move clip down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {selectedClips.length > 2 && (
                    <button
                      onClick={() => removeClip(idx)}
                      className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                      title="Remove clip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transition Node between clip[idx] and clip[idx+1] */}
              {idx < selectedClips.length - 1 && trans && (
                <div className="relative pl-6 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setEditingTransitionIdx(editingTransitionIdx === idx ? null : idx)
                      }
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        editingTransitionIdx === idx
                          ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-500/40'
                          : 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300 hover:bg-indigo-900'
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span className="capitalize">{trans.type.replace('-', ' ')}</span>
                      <span className="font-mono text-[9px] opacity-80">({trans.duration}s)</span>
                      <ChevronDown className={`w-2.5 h-2.5 transition-transform ${editingTransitionIdx === idx ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Inline Transition Picker Popover */}
                  {editingTransitionIdx === idx && (
                    <div className="mt-1.5 p-2 bg-zinc-950 rounded-xl border border-indigo-800/80 space-y-2 shadow-lg z-20">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-indigo-400" />
                          Transition between Clip #{idx + 1} & #{idx + 2}:
                        </span>
                        <span className="font-mono text-indigo-400 text-[10px]">{trans.duration}s</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1">
                        {QUICK_TRANSITIONS.map((qt) => (
                          <button
                            key={qt.id}
                            onClick={() => {
                              updateTransition(idx, { type: qt.id });
                              playTransitionSoundFx('swish', 0.4);
                            }}
                            className={`p-1.5 rounded-lg text-[9px] font-bold flex flex-col items-center gap-0.5 border ${
                              trans.type === qt.id
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{qt.icon}</span>
                            <span className="truncate">{qt.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400">Duration:</span>
                        <div className="flex items-center gap-1">
                          {[0.4, 0.6, 0.8, 1.2].map((dur) => (
                            <button
                              key={dur}
                              onClick={() => updateTransition(idx, { duration: dur })}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                trans.duration === dur
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {dur}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add clip pills from library */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400">Add from Sample Library:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SAMPLE_VIDEOS.map((v) => (
            <button
              key={v.id}
              onClick={() => addClip(v)}
              className="shrink-0 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span className="truncate max-w-[100px]">{v.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-1 flex items-center gap-2">
        <button
          id="btn-merge-clips"
          onClick={() => onJoinVideos(selectedClips, transitions)}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
          <span>Join {selectedClips.length} Clips with Transitions & Export</span>
        </button>
      </div>
    </div>
  );
};
