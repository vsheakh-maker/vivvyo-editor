/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  Sliders,
  Check,
  Zap,
  Layers,
  Film,
  FastForward,
} from 'lucide-react';
import { TransitionSettings, TransitionType, VideoAsset } from '../../types.ts';
import { playTransitionSoundFx } from '../../utils/audioSynth.ts';
import { SAMPLE_VIDEOS } from '../../data/sampleMedia.ts';

interface TransitionPresetDef {
  id: TransitionType;
  name: string;
  category: 'dissolve' | 'fade' | 'zoom' | 'motion' | 'fx';
  desc: string;
  badge: string;
  iconName: string;
  defaultDuration: number;
}

export const TRANSITION_PRESETS: TransitionPresetDef[] = [
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    category: 'dissolve',
    desc: 'Soft continuous blending between clips',
    badge: 'Classic',
    iconName: 'Blend',
    defaultDuration: 0.8,
  },
  {
    id: 'fade-black',
    name: 'Fade to Black',
    category: 'fade',
    desc: 'Cinematic dip into darkness then fade-in',
    badge: 'Cinema',
    iconName: 'Moon',
    defaultDuration: 0.8,
  },
  {
    id: 'fade-white',
    name: 'Flash to White',
    category: 'fade',
    desc: 'Bright music-video strobe flash',
    badge: 'Music Video',
    iconName: 'Sun',
    defaultDuration: 0.5,
  },
  {
    id: 'zoom-in',
    name: 'Zoom In Push',
    category: 'zoom',
    desc: 'Dynamic forward kinetic camera push',
    badge: 'TikTok Trend',
    iconName: 'ZoomIn',
    defaultDuration: 0.6,
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out Reveal',
    category: 'zoom',
    desc: 'Pull back to reveal incoming scene',
    badge: 'Dynamic',
    iconName: 'ZoomOut',
    defaultDuration: 0.6,
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    category: 'motion',
    desc: 'Horizontal push wipe across viewport',
    badge: 'Vlog',
    iconName: 'ArrowLeft',
    defaultDuration: 0.5,
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    category: 'motion',
    desc: 'Smooth horizontal glide transition',
    badge: 'Story',
    iconName: 'ArrowRight',
    defaultDuration: 0.5,
  },
  {
    id: 'blur-dissolve',
    name: 'Blur Defocus',
    category: 'fx',
    desc: 'Optical gaussian defocus transition',
    badge: 'Aesthetic',
    iconName: 'Aperture',
    defaultDuration: 0.8,
  },
  {
    id: 'glitch',
    name: 'RGB Glitch Shock',
    category: 'fx',
    desc: 'Cyberpunk chromatic displacement flash',
    badge: 'Phonk & Trap',
    iconName: 'Zap',
    defaultDuration: 0.4,
  },
];

interface TransitionToolProps {
  settings: TransitionSettings;
  onChangeSettings: (settings: TransitionSettings) => void;
  onApplyToJoiner?: () => void;
  onReset: () => void;
  currentVideo?: VideoAsset;
  onOpenJoiner?: () => void;
}

export const TransitionTool: React.FC<TransitionToolProps> = ({
  settings,
  onChangeSettings,
  onApplyToJoiner,
  onReset,
  currentVideo,
  onOpenJoiner,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'dissolve' | 'fade' | 'zoom' | 'motion' | 'fx'>('all');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sample clips for preview
  const clip1 = currentVideo || SAMPLE_VIDEOS[0];
  const clip2 = SAMPLE_VIDEOS.find((v) => v.id !== clip1.id) || SAMPLE_VIDEOS[1];

  const filteredPresets = activeCategory === 'all'
    ? TRANSITION_PRESETS
    : TRANSITION_PRESETS.filter((p) => p.category === activeCategory);

  const handleSelectPreset = (preset: TransitionPresetDef) => {
    onChangeSettings({
      ...settings,
      type: preset.id,
      duration: preset.defaultDuration,
    });
    // Trigger preview
    playPreviewAnimation();
    if (settings.soundFx && settings.soundFx !== 'none') {
      playTransitionSoundFx(settings.soundFx, 0.6);
    }
  };

  // Run transition animation preview on canvas
  const playPreviewAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlayingPreview(true);
    setPreviewProgress(0);

    const startTime = performance.now();
    const durationMs = (settings.duration || 0.8) * 1000;

    // Trigger sound fx if enabled
    if (settings.soundFx && settings.soundFx !== 'none') {
      playTransitionSoundFx(settings.soundFx, 0.6);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      setPreviewProgress(progress);

      renderTransitionFrame(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlayingPreview(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Render transition frame directly to preview canvas
  const renderTransitionFrame = (p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Ease in out math
    let progress = p;
    if (settings.easing === 'ease-in-out') {
      progress = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    } else if (settings.easing === 'bounce') {
      progress = Math.min(1, Math.sin(p * Math.PI * 0.5) * 1.05);
    }

    // Colors representing Scene A and Scene B
    const gradA = ctx.createLinearGradient(0, 0, w, h);
    gradA.addColorStop(0, '#3b82f6');
    gradA.addColorStop(1, '#1d4ed8');

    const gradB = ctx.createLinearGradient(0, 0, w, h);
    gradB.addColorStop(0, '#ec4899');
    gradB.addColorStop(1, '#9333ea');

    const drawSceneA = (alpha = 1, scale = 1, offX = 0, offY = 0) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(w / 2 + offX, h / 2 + offY);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);
      ctx.fillStyle = gradA;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Scene 1 (Outgoing)', w / 2, h / 2 - 10);
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(clip1.title, w / 2, h / 2 + 14);
      ctx.restore();
    };

    const drawSceneB = (alpha = 1, scale = 1, offX = 0, offY = 0) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(w / 2 + offX, h / 2 + offY);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);
      ctx.fillStyle = gradB;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Scene 2 (Incoming)', w / 2, h / 2 - 10);
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(clip2.title, w / 2, h / 2 + 14);
      ctx.restore();
    };

    switch (settings.type) {
      case 'cross-dissolve':
        drawSceneA(1);
        drawSceneB(progress);
        break;

      case 'fade-black':
        if (progress < 0.5) {
          const fadeOut = 1 - progress * 2;
          drawSceneA(fadeOut);
          ctx.fillStyle = `rgba(0, 0, 0, ${1 - fadeOut})`;
          ctx.fillRect(0, 0, w, h);
        } else {
          const fadeIn = (progress - 0.5) * 2;
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);
          drawSceneB(fadeIn);
        }
        break;

      case 'fade-white':
        if (progress < 0.5) {
          drawSceneA(1);
          ctx.fillStyle = `rgba(255, 255, 255, ${progress * 2})`;
          ctx.fillRect(0, 0, w, h);
        } else {
          drawSceneB(1);
          ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * 2})`;
          ctx.fillRect(0, 0, w, h);
        }
        break;

      case 'zoom-in': {
        const scaleA = 1 + progress * 0.9;
        const scaleB = 0.6 + progress * 0.4;
        drawSceneA(1 - progress, scaleA);
        drawSceneB(progress, scaleB);
        break;
      }

      case 'zoom-out': {
        const scaleA = 1 - progress * 0.4;
        const scaleB = 1.6 - progress * 0.6;
        drawSceneA(1 - progress, scaleA);
        drawSceneB(progress, scaleB);
        break;
      }

      case 'slide-left':
        drawSceneA(1, 1, -progress * w, 0);
        drawSceneB(1, 1, (1 - progress) * w, 0);
        break;

      case 'slide-right':
        drawSceneA(1, 1, progress * w, 0);
        drawSceneB(1, 1, -(1 - progress) * w, 0);
        break;

      case 'blur-dissolve': {
        drawSceneA(1 - progress);
        ctx.save();
        ctx.filter = `blur(${Math.sin(progress * Math.PI) * 12}px)`;
        drawSceneB(progress);
        ctx.restore();
        break;
      }

      case 'glitch': {
        drawSceneA(1 - progress);
        if (progress > 0.2 && progress < 0.8) {
          const jitterX = (Math.random() - 0.5) * 28;
          const jitterY = (Math.random() - 0.5) * 14;
          drawSceneB(progress, 1, jitterX, jitterY);
          // Glitch scanlines
          ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
          ctx.fillRect(0, Math.random() * h, w, 6);
          ctx.fillStyle = 'rgba(255, 0, 128, 0.25)';
          ctx.fillRect(0, Math.random() * h, w, 8);
        } else {
          drawSceneB(progress);
        }
        break;
      }

      default:
        drawSceneA(1 - progress);
        drawSceneB(progress);
        break;
    }
  };

  useEffect(() => {
    renderTransitionFrame(0);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [settings]);

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Transitions & Seamless Blends
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                {settings.duration}s
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenJoiner && (
            <button
              onClick={onOpenJoiner}
              className="text-[11px] font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/60 border border-sky-800/60 px-2 py-1 rounded-lg"
            >
              <Layers className="w-3 h-3" />
              <span>Open Joiner</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="p-1 rounded text-zinc-400 hover:text-white"
            title="Reset transitions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Live Transition Preview Canvas */}
      <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={100}
          className="w-full h-24 object-cover"
        />

        {/* Overlay preview controls */}
        <div className="absolute inset-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="text-[11px] font-bold text-white drop-shadow">
              {TRANSITION_PRESETS.find((p) => p.id === settings.type)?.name || 'Transition'}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              id="btn-play-transition-preview"
              onClick={playPreviewAnimation}
              disabled={isPlayingPreview}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isPlayingPreview ? 'Blending...' : 'Test Transition'}</span>
            </button>
          </div>
        </div>

        {/* Progress scrub line */}
        {isPlayingPreview && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-75"
            style={{ width: `${previewProgress * 100}%` }}
          />
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
        {(['all', 'dissolve', 'fade', 'zoom', 'motion', 'fx'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg font-medium capitalize shrink-0 transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Transitions' : cat}
          </button>
        ))}
      </div>

      {/* Transition Preset Cards */}
      <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = settings.type === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 text-white'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-1 py-0.5 rounded">
                    {preset.badge}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className="text-[11px] font-bold text-white truncate">{preset.name}</div>
                <div className="text-[9px] text-zinc-400 line-clamp-1">{preset.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Transition Fine-tuning Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/70">
        {/* Duration Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3 text-indigo-400" />
              Duration:
            </span>
            <span className="font-mono text-indigo-400 font-bold">{settings.duration}s</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.1}
              value={settings.duration}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  duration: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex items-center gap-1 shrink-0">
              {[0.4, 0.8, 1.2].map((d) => (
                <button
                  key={d}
                  onClick={() => onChangeSettings({ ...settings, duration: d })}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    settings.duration === d
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sound FX for Transition */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-pink-400" />
              Audio Whoosh / FX:
            </span>
            <button
              onClick={() => playTransitionSoundFx(settings.soundFx || 'whoosh', 0.6)}
              className="text-[9px] font-bold text-pink-400 hover:text-pink-300"
            >
              Audition
            </button>
          </div>
          <div className="flex items-center gap-1">
            {(['none', 'whoosh', 'swish', 'pop', 'glitch'] as const).map((sfx) => (
              <button
                key={sfx}
                onClick={() => {
                  onChangeSettings({ ...settings, soundFx: sfx });
                  if (sfx !== 'none') playTransitionSoundFx(sfx, 0.6);
                }}
                className={`flex-1 text-[10px] capitalize py-1 rounded-lg border transition-all ${
                  (settings.soundFx || 'none') === sfx
                    ? 'bg-pink-950/80 border-pink-500 text-pink-200 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sfx}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={playPreviewAnimation}
          className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Replay Blend</span>
        </button>

        {onApplyToJoiner && (
          <button
            onClick={onApplyToJoiner}
            className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply to Video Joiner</span>
          </button>
        )}
      </div>
    </div>
  );
};
