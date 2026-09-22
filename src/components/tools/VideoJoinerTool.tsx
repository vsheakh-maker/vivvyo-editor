import React, { useState } from 'react';
import { Layers, Plus, ArrowUp, ArrowDown, Trash2, Sparkles } from 'lucide-react';
import { VideoAsset } from '../../types.ts';
import { SAMPLE_VIDEOS } from '../../data/sampleMedia.ts';

interface VideoJoinerToolProps {
  currentVideo: VideoAsset;
  onJoinVideos: (clips: VideoAsset[]) => void;
}

export const VideoJoinerTool: React.FC<VideoJoinerToolProps> = ({ currentVideo, onJoinVideos }) => {
  const [selectedClips, setSelectedClips] = useState<VideoAsset[]>([
    currentVideo,
    SAMPLE_VIDEOS.find((v) => v.id !== currentVideo.id) || SAMPLE_VIDEOS[0],
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...selectedClips];
    const item = copy.splice(index, 1)[0];
    copy.splice(index - 1, 0, item);
    setSelectedClips(copy);
  };

  const moveDown = (index: number) => {
    if (index === selectedClips.length - 1) return;
    const copy = [...selectedClips];
    const item = copy.splice(index, 1)[0];
    copy.splice(index + 1, 0, item);
    setSelectedClips(copy);
  };

  const removeClip = (index: number) => {
    if (selectedClips.length <= 2) return;
    setSelectedClips(selectedClips.filter((_, i) => i !== index));
  };

  const addClip = (video: VideoAsset) => {
    setSelectedClips([...selectedClips, video]);
  };

  const totalDuration = selectedClips.reduce((acc, c) => acc + c.duration, 0);

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Video Joiner / Merger</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/80">
          <span>{selectedClips.length} Clips</span>
          <span>•</span>
          <span>~{Math.round(totalDuration)}s Total</span>
        </div>
      </div>

      {/* Selected Sequence */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {selectedClips.map((clip, idx) => (
          <div
            key={`${clip.id}-${idx}`}
            className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-xs"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold flex items-center justify-center">
                #{idx + 1}
              </span>
              <span className="truncate font-semibold text-zinc-200">{clip.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{clip.duration}s</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === selectedClips.length - 1}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              {selectedClips.length > 2 && (
                <button
                  onClick={() => removeClip(idx)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add clip pills from library */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400">Add from Sample Library:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SAMPLE_VIDEOS.map((v) => (
            <button
              key={v.id}
              onClick={() => addClip(v)}
              className="shrink-0 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span className="truncate max-w-[100px]">{v.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-1">
        <button
          id="btn-merge-clips"
          onClick={() => onJoinVideos(selectedClips)}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
          <span>Join {selectedClips.length} Clips & Export</span>
        </button>
      </div>
    </div>
  );
};
