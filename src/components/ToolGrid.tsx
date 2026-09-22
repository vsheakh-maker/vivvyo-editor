import React from 'react';
import {
  Scissors,
  Crop,
  Sparkles,
  Music,
  Gauge,
  RotateCw,
  Archive,
  FileAudio,
  Type,
  Images,
  Layers,
  Wand2,
  Flame,
  Camera,
} from 'lucide-react';
import { ToolType } from '../types.ts';

interface ToolGridProps {
  onSelectTool: (tool: ToolType) => void;
  activeTool: ToolType | null;
}

interface ToolCardDef {
  id: ToolType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  isNew?: boolean;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, activeTool }) => {
  const tools: ToolCardDef[] = [
    {
      id: 'templates',
      title: 'Templates & TikTok',
      subtitle: 'Trending styles & 50+ viral songs',
      icon: Flame,
      gradient: 'from-pink-500 via-rose-500 to-purple-600',
      badge: '🔥 Hot',
      isNew: true,
    },
    {
      id: 'bg-remove',
      title: 'AI BG Remover',
      subtitle: 'Auto photo cutout & backdrops',
      icon: Wand2,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      badge: 'AI Edge',
      isNew: true,
    },
    {
      id: 'font-generator',
      title: 'Font & Text Generator',
      subtitle: 'Viral TikTok styles, 3D & neon',
      icon: Type,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      badge: 'New',
      isNew: true,
    },
    {
      id: 'trim',
      title: 'Trim & Cut',
      subtitle: 'Cut segments & clip duration',
      icon: Scissors,
      gradient: 'from-amber-500 to-rose-500',
      badge: 'Popular',
    },
    {
      id: 'crop',
      title: 'Crop Video',
      subtitle: 'Custom ratio, 9:16 Reels & 1:1',
      icon: Crop,
      gradient: 'from-indigo-500 to-cyan-500',
      badge: 'Custom',
    },
    {
      id: 'filter',
      title: 'Filters & LUTs',
      subtitle: '14 Cinematic filters & glazes',
      icon: Sparkles,
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      id: 'audio',
      title: 'Audio & Music',
      subtitle: 'Mix audio, mute & 50+ TikTok BGM',
      icon: Music,
      gradient: 'from-violet-500 to-indigo-600',
    },
    {
      id: 'speed',
      title: 'Speed Control',
      subtitle: '0.25x Slow-mo to 4x Fast',
      icon: Gauge,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'transform',
      title: 'Rotate & Mirror',
      subtitle: '90° Orientation & Selfie Flip',
      icon: RotateCw,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'compress',
      title: 'Auto Compress',
      subtitle: 'Reduce size up to 70% automatically',
      icon: Archive,
      gradient: 'from-orange-500 to-amber-600',
      badge: 'Save 70%',
    },
    {
      id: 'extract-audio',
      title: 'Extract to MP3',
      subtitle: 'Rip audio track as WAV/MP3',
      icon: FileAudio,
      gradient: 'from-rose-500 to-purple-600',
    },
    {
      id: 'watermark',
      title: 'Watermark & Logo',
      subtitle: 'Custom branding & overlay',
      icon: Type,
      gradient: 'from-teal-500 to-emerald-600',
    },
    {
      id: 'slideshow',
      title: 'Photo Slideshow',
      subtitle: 'Animate photos with music',
      icon: Images,
      gradient: 'from-pink-500 to-rose-600',
      badge: 'Creative',
    },
    {
      id: 'joiner',
      title: 'Video Joiner',
      subtitle: 'Merge clips into one movie',
      icon: Layers,
      gradient: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-16 bg-zinc-950">
      {/* Header text */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            Vivvyo Creative Toolkit
            <span className="text-[10px] font-normal text-zinc-400">({tools.length} Tools)</span>
          </h2>
          <p className="text-[11px] text-zinc-400">Tap any tool to edit, format, or enhance your video</p>
        </div>
        <span className="text-[10px] font-bold text-pink-400 bg-pink-950/60 border border-pink-800/60 px-2 py-0.5 rounded-full">
          Mobile & Tablet
        </span>
      </div>

      {/* Grid of Tools (2 columns on mobile, 3-4 on tablet) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              id={`tool-card-${tool.id}`}
              onClick={() => onSelectTool(tool.id)}
              className={`group relative text-left p-3 rounded-2xl border transition-all duration-150 active:scale-[0.98] flex flex-col justify-between overflow-hidden shadow-sm ${
                isSelected
                  ? 'bg-zinc-800/95 border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/10'
                  : 'bg-zinc-900/85 hover:bg-zinc-800/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Badge if any */}
              {tool.badge && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span
                    className={`text-[9px] font-black tracking-tight px-1.5 py-0.5 rounded-full border ${
                      tool.isNew
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400/40 shadow-sm'
                        : 'bg-zinc-800/90 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>
              )}

              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-md mb-2.5 transition-transform group-hover:scale-105`}
              >
                <Icon className="w-5 h-5 drop-shadow-sm" />
              </div>

              {/* Tool Text */}
              <div>
                <h3 className="text-xs font-bold text-zinc-100 tracking-tight group-hover:text-white">
                  {tool.title}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 group-hover:text-zinc-300">
                  {tool.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
