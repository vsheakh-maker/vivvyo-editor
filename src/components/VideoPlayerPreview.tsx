import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCw, Maximize2 } from 'lucide-react';
import {
  TransformSettings,
  WatermarkSettings,
  AudioSettings,
  AspectRatioType,
  VideoAsset,
  CustomCropSettings,
  FontGeneratorSettings,
} from '../types.ts';

interface VideoPlayerPreviewProps {
  video: VideoAsset;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  filterCss: string;
  transform: TransformSettings;
  watermark: WatermarkSettings;
  fontGenerator?: FontGeneratorSettings;
  bgStickerUrl?: string | null;
  audio: AudioSettings;
  aspectRatio: AspectRatioType;
  customCrop?: CustomCropSettings;
  speed: number;
  trimRange?: [number, number];
  onVideoError?: () => void;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  video,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  videoRef,
  filterCss,
  transform,
  watermark,
  fontGenerator,
  bgStickerUrl,
  audio,
  aspectRatio,
  customCrop,
  speed,
  trimRange,
  onVideoError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [internalMuted, setInternalMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Reset error when video changes
  useEffect(() => {
    setLoadError(false);
  }, [video.url]);

  // Sync speed to videoRef
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, videoRef]);

  // Sync audio mute/volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = audio.muted || internalMuted;
      videoRef.current.volume = audio.videoVolume;
    }
  }, [audio.muted, audio.videoVolume, internalMuted, videoRef]);

  // Handle trim bounds loop
  useEffect(() => {
    if (!trimRange || !videoRef.current) return;
    const [start, end] = trimRange;
    if (currentTime < start) {
      videoRef.current.currentTime = start;
    } else if (currentTime > end) {
      videoRef.current.currentTime = start;
    }
  }, [currentTime, trimRange, videoRef]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onTimeUpdate(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Compute transform styles
  const transformStyle: React.CSSProperties = {
    transform: `rotate(${transform.rotation}deg) scaleX(${transform.flipHorizontal ? -1 : 1}) scaleY(${transform.flipVertical ? -1 : 1})`,
    filter: filterCss !== 'none' ? filterCss : undefined,
    transition: 'transform 0.2s ease, filter 0.2s ease',
  };

  // Compute aspect ratio mask box
  let aspectStyle: React.CSSProperties = { width: '100%', height: '100%' };
  if (aspectRatio === '9:16') {
    aspectStyle = { aspectRatio: '9 / 16', maxHeight: '100%', maxWidth: '100%' };
  } else if (aspectRatio === '1:1') {
    aspectStyle = { aspectRatio: '1 / 1', maxHeight: '100%', maxWidth: '100%' };
  } else if (aspectRatio === '16:9') {
    aspectStyle = { aspectRatio: '16 / 9', maxHeight: '100%', maxWidth: '100%' };
  } else if (aspectRatio === '4:5') {
    aspectStyle = { aspectRatio: '4 / 5', maxHeight: '100%', maxWidth: '100%' };
  } else if (aspectRatio === '4:3') {
    aspectStyle = { aspectRatio: '4 / 3', maxHeight: '100%', maxWidth: '100%' };
  } else if (aspectRatio === 'custom' && customCrop) {
    aspectStyle = {
      aspectRatio: `${customCrop.widthRatio} / ${customCrop.heightRatio}`,
      maxHeight: '100%',
      maxWidth: '100%',
    };
  }

  // Watermark position styles
  const getWatermarkPositionClasses = () => {
    switch (watermark.position) {
      case 'top-left':
        return 'top-3 left-3';
      case 'top-right':
        return 'top-3 right-3';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-left':
        return 'bottom-4 left-3';
      case 'bottom-right':
        return 'bottom-4 right-3';
      default:
        return 'top-3 left-3';
    }
  };

  // Compute text generator style
  const getFontGeneratorStyle = (): React.CSSProperties => {
    if (!fontGenerator) return {};
    const fg = fontGenerator;
    const style: React.CSSProperties = {
      fontFamily: fg.fontFamily || 'sans-serif',
      fontSize: `${Math.max(12, Math.round((fg.fontSize || 32) * 0.65))}px`,
      color: fg.color || '#ffffff',
      lineHeight: 1.2,
      WebkitTextStroke: fg.strokeWidth && fg.strokeWidth > 0 ? `${fg.strokeWidth}px ${fg.strokeColor}` : undefined,
    };

    if (fg.effect === 'glow') {
      style.textShadow = `0 0 ${fg.glowIntensity || 12}px ${fg.glowColor || '#00f0ff'}`;
    } else if (fg.effect === 'shadow') {
      style.textShadow = '2px 2px 5px rgba(0,0,0,0.9)';
    } else if (fg.effect === '3d') {
      style.textShadow = '2px 2px 0 #000, 3px 3px 0 #333';
    } else if (fg.effect === 'comic') {
      style.textShadow = '3px 3px 0 #dc2626, 4px 4px 0 #000';
    } else if (fg.effect === 'vhs') {
      style.textShadow = '2px 0 0 #00ffff, -2px 0 0 #ff00ff';
    }

    return style;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden shrink-0 select-none group"
      style={{ height: '36vh', minHeight: '220px', maxHeight: '340px' }}
    >
      {/* Video Framing & Aspect Ratio Container */}
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden p-2">
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-xl shadow-2xl bg-zinc-950 transition-all duration-300"
          style={aspectStyle}
        >
          <video
            ref={videoRef}
            src={video.url}
            crossOrigin="anonymous"
            playsInline
            loop={!trimRange}
            onClick={onTogglePlay}
            onError={() => {
              setLoadError(true);
              if (onVideoError) {
                onVideoError();
              }
            }}
            onTimeUpdate={() => {
              if (!isScrubbing && videoRef.current) {
                onTimeUpdate(videoRef.current.currentTime);
              }
            }}
            className="w-full h-full object-cover cursor-pointer"
            style={transformStyle}
          />

          {/* Recovery overlay if video fails to load */}
          {loadError && (
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <RotateCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Video Source Loading Issue</p>
                <p className="text-[10px] text-zinc-400 max-w-[200px] mt-0.5">
                  Remote source blocked or offline. Switching to studio demo clip...
                </p>
              </div>
              {onVideoError && (
                <button
                  type="button"
                  onClick={() => onVideoError()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-md active:scale-95 transition-all"
                >
                  Load Studio Demo
                </button>
              )}
            </div>
          )}

          {/* Background Remover Cutout Sticker Overlay */}
          {bgStickerUrl && (
            <div className="absolute bottom-6 right-6 w-20 h-20 pointer-events-none z-20 animate-in fade-in zoom-in duration-300">
              <img
                src={bgStickerUrl}
                alt="Cutout Sticker"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          )}

          {/* Font & Text Generator Overlay */}
          {fontGenerator && fontGenerator.text && fontGenerator.text.trim() && (
            <div
              className="absolute left-0 right-0 z-25 text-center pointer-events-none px-4 transition-all"
              style={{
                top: `${fontGenerator.positionY || 70}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <div
                className={`inline-block max-w-[90%] ${
                  fontGenerator.bgPill ? 'px-3 py-1 rounded-xl backdrop-blur-md' : ''
                }`}
                style={{
                  backgroundColor: fontGenerator.bgPill
                    ? fontGenerator.pillColor || '#000000aa'
                    : 'transparent',
                }}
              >
                <span style={getFontGeneratorStyle()}>{fontGenerator.text}</span>
              </div>
            </div>
          )}

          {/* Watermark Overlay in live preview */}
          {watermark.text && watermark.text.trim() && (
            <div
              className={`absolute pointer-events-none z-20 ${getWatermarkPositionClasses()}`}
              style={{
                color: watermark.color,
                opacity: watermark.opacity,
                fontSize: `${Math.max(11, Math.round(watermark.fontSize * 0.7))}px`,
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              <span
                className={`px-2 py-0.5 rounded ${
                  watermark.hasBackground ? 'bg-black/60 backdrop-blur-xs' : ''
                }`}
              >
                {watermark.text}
              </span>
            </div>
          )}

          {/* Aspect Ratio Guide Grid (subtle outline) */}
          {aspectRatio !== 'original' && (
            <div className="absolute inset-0 border border-indigo-400/40 pointer-events-none z-10 ring-1 ring-white/10" />
          )}

          {/* Play/Pause Overlay indicator */}
          <button
            onClick={onTogglePlay}
            className={`absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition-opacity ${
              isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="w-13 h-13 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-transform active:scale-90">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Floating Mini Controls & Timeline Bar */}
      <div className="absolute bottom-2 left-3 right-3 z-30 flex items-center space-x-2 bg-zinc-950/85 backdrop-blur-md py-1.5 px-3 rounded-full border border-zinc-800 shadow-lg">
        {/* Play/Pause button */}
        <button
          onClick={onTogglePlay}
          className="text-white hover:text-indigo-400 transition-colors p-1"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Timestamp */}
        <span className="text-[10px] font-mono text-zinc-400 font-medium">
          {formatTime(currentTime)}
        </span>

        {/* Video Timeline Scrubber */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            onTouchStart={() => setIsScrubbing(true)}
            onTouchEnd={() => setIsScrubbing(false)}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />

          {/* Trim indicators if active */}
          {trimRange && duration > 0 && (
            <div
              className="absolute h-1 bg-indigo-500/60 rounded pointer-events-none"
              style={{
                left: `${(trimRange[0] / duration) * 100}%`,
                width: `${((trimRange[1] - trimRange[0]) / duration) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Total duration */}
        <span className="text-[10px] font-mono text-zinc-500">
          {formatTime(duration)}
        </span>

        {/* Audio Mute toggle */}
        <button
          onClick={() => setInternalMuted(!internalMuted)}
          className="text-zinc-400 hover:text-white transition-colors p-1"
        >
          {audio.muted || internalMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
