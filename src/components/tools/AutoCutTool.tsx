import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Scissors,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { VideoAsset, SilenceInterval, SpeechInterval } from '../../types.ts';
import {
  extractAndDecodeAudio,
  detectAudioSilence,
  computeSpeechSegments,
  AudioAnalysisResult,
  WaveformPoint,
} from '../../utils/audioSilenceDetector.ts';

interface AutoCutToolProps {
  currentVideo: VideoAsset;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onApplyCleanedClip: (
    speechSegments: SpeechInterval[],
    silences: SilenceInterval[],
    cleanedDuration: number
  ) => void;
  onToggleLiveSkip: (enabled: boolean, silences: SilenceInterval[]) => void;
  isLiveSkipActive?: boolean;
}

export const AutoCutTool: React.FC<AutoCutToolProps> = ({
  currentVideo,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
  onApplyCleanedClip,
  onToggleLiveSkip,
  isLiveSkipActive = false,
}) => {
  // Detection Settings
  const [thresholdDb, setThresholdDb] = useState<number>(-32);
  const [minDuration, setMinDuration] = useState<number>(0.4);
  const [padding, setPadding] = useState<number>(0.08);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [analyzeProgress, setAnalyzeProgress] = useState<number>(0);
  const [decodedAudioBuffer, setDecodedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [activeSilenceId, setActiveSilenceId] = useState<string | null>(null);

  // Audition Mode: 'normal' | 'jump-cut' | 'silence-only'
  const [auditionMode, setAuditionMode] = useState<'jump-cut' | 'silence-only' | 'normal'>('jump-cut');
  const [isProcessingCut, setIsProcessingCut] = useState<boolean>(false);

  // Timeline canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial Audio Extraction & Decoding
  useEffect(() => {
    let isCancelled = false;

    async function loadAudio() {
      setIsAnalyzing(true);
      setAnalyzeProgress(10);
      try {
        const { audioBuffer } = await extractAndDecodeAudio(currentVideo.url, (pct) => {
          if (!isCancelled) setAnalyzeProgress(pct);
        });
        if (isCancelled) return;
        setDecodedAudioBuffer(audioBuffer);

        const result = detectAudioSilence(audioBuffer, duration, {
          thresholdDb,
          minSilenceDuration: minDuration,
          padding,
        });
        setAnalysis(result);
      } catch (err) {
        console.error('Audio load error:', err);
      } finally {
        if (!isCancelled) setIsAnalyzing(false);
      }
    }

    loadAudio();

    return () => {
      isCancelled = true;
    };
  }, [currentVideo.url, duration]);

  // Recompute silences when threshold, minDuration, or padding sliders change
  useEffect(() => {
    if (isAnalyzing) return;
    const result = detectAudioSilence(decodedAudioBuffer, duration, {
      thresholdDb,
      minSilenceDuration: minDuration,
      padding,
    });
    setAnalysis(result);
  }, [thresholdDb, minDuration, padding, decodedAudioBuffer, duration, isAnalyzing]);

  // Handle jump-cut playback loop in audition mode
  useEffect(() => {
    if (!analysis || !isPlaying) return;

    const silences = analysis.silences.filter((s) => s.enabled);
    if (silences.length === 0) return;

    if (auditionMode === 'jump-cut') {
      // If currentTime lands inside an enabled silence, jump to end of that silence
      for (const s of silences) {
        if (currentTime >= s.start && currentTime < s.end) {
          onSeek(Math.min(duration, s.end + 0.02));
          break;
        }
      }
    } else if (auditionMode === 'silence-only') {
      // Find current or next silence
      const inAnySilence = silences.some((s) => currentTime >= s.start && currentTime <= s.end);
      if (!inAnySilence) {
        const nextSilence = silences.find((s) => s.start > currentTime) || silences[0];
        if (nextSilence) {
          onSeek(nextSilence.start);
        }
      }
    }
  }, [currentTime, isPlaying, auditionMode, analysis, duration, onSeek]);

  // Toggle specific silence on/off
  const handleToggleSilence = (id: string) => {
    if (!analysis) return;
    const updated = analysis.silences.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    const speechSegments = computeSpeechSegments(updated, duration);
    const cleanedDuration = speechSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const timeSaved = Math.max(0, duration - cleanedDuration);
    const percentSaved = duration > 0 ? Math.round((timeSaved / duration) * 100) : 0;

    setAnalysis({
      ...analysis,
      silences: updated,
      speechSegments,
      cleanedDuration: Math.round(cleanedDuration * 100) / 100,
      timeSaved: Math.round(timeSaved * 100) / 100,
      percentSaved,
    });
  };

  // Render Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysis) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, width, height);

    // Draw gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const secondStep = Math.max(1, Math.round(duration / 10));
    for (let s = 0; s <= duration; s += secondStep) {
      const x = (s / duration) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw Silence Intervals (Striped Red zones)
    for (const sil of analysis.silences) {
      const startX = (sil.start / duration) * width;
      const endX = (sil.end / duration) * width;
      const zoneW = Math.max(2, endX - startX);

      if (sil.enabled) {
        // Red striped pattern for cut sections
        ctx.fillStyle = sil.id === activeSilenceId ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(startX, 0, zoneW, height);

        // Border
        ctx.strokeStyle = sil.id === activeSilenceId ? '#ef4444' : 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, 0, zoneW, height);

        // Diagonal hatch stripes
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 1;
        const stripeGap = 6;
        for (let sx = startX - height; sx < endX; sx += stripeGap) {
          ctx.beginPath();
          ctx.moveTo(sx, height);
          ctx.lineTo(sx + height, 0);
          ctx.stroke();
        }

        // Scissors cut icon / text
        if (zoneW > 24) {
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`✂ -${sil.duration}s`, startX + zoneW / 2, height / 2 + 3);
        }
      } else {
        // Disabled silence (kept pause)
        ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.fillRect(startX, 0, zoneW, height);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.strokeRect(startX, 0, zoneW, height);
      }
    }

    // Draw Waveform Bars
    const points = analysis.waveform;
    const barWidth = Math.max(1.5, width / points.length - 1);
    const midY = height / 2;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const x = (i / points.length) * width;
      const barH = Math.max(3, pt.amplitude * (height * 0.8));

      if (pt.isSilent) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      } else {
        // Emerald to cyan gradient speech peak
        const grad = ctx.createLinearGradient(0, midY - barH / 2, 0, midY + barH / 2);
        grad.addColorStop(0, '#34d399');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = grad;
      }

      ctx.beginPath();
      ctx.roundRect(x, midY - barH / 2, barWidth, barH, 1);
      ctx.fill();
    }

    // Draw Playhead Line
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead handle
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.beginPath();
    ctx.arc(playheadX, 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [analysis, duration, currentTime, activeSilenceId]);

  // Canvas click to seek or select silence
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !analysis) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / rect.width) * duration;
    onSeek(Math.min(duration, Math.max(0, clickTime)));

    // Check if clicked inside a silence interval
    const hit = analysis.silences.find((s) => clickTime >= s.start && clickTime <= s.end);
    if (hit) {
      setActiveSilenceId(hit.id);
    } else {
      setActiveSilenceId(null);
    }
  };

  const activeSilence = analysis?.silences.find((s) => s.id === activeSilenceId);

  const handleApply = async () => {
    if (!analysis) return;
    setIsProcessingCut(true);
    try {
      const activeSilences = analysis.silences.filter((s) => s.enabled);
      const segments = computeSpeechSegments(activeSilences, duration);
      const cleanedDur = segments.reduce((sum, s) => sum + s.duration, 0);
      onApplyCleanedClip(segments, activeSilences, cleanedDur);
    } finally {
      setIsProcessingCut(false);
    }
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-4">
      {/* Header & Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Auto-Cut Silence & Pauses</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                AI Jump-Cut
              </span>
            </h3>
          </div>
        </div>

        {/* Stats Pill */}
        {analysis && (
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <div className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60 flex items-center space-x-1.5">
              <span className="text-zinc-400">Dead air cut:</span>
              <span className="font-bold text-rose-400">-{analysis.timeSaved}s</span>
              <span className="text-amber-400">({analysis.percentSaved}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Timeline Visualizer */}
      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Speech Audio
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Silent Pauses ({analysis?.silences.filter((s) => s.enabled).length || 0})
            </span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px] text-zinc-400">
            <span>{Math.round(currentTime * 10) / 10}s</span>
            <span>/</span>
            <span>{Math.round(duration * 10) / 10}s</span>
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="relative group">
          <canvas
            ref={canvasRef}
            width={700}
            height={72}
            onClick={handleCanvasClick}
            className="w-full h-18 rounded-lg bg-zinc-950 cursor-pointer block border border-zinc-800 hover:border-zinc-700 transition-colors"
          />

          {isAnalyzing && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center space-x-2 rounded-lg">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-zinc-300">
                Analyzing audio waveform ({analyzeProgress}%)...
              </span>
            </div>
          )}
        </div>

        {/* Time Comparison Badges */}
        {analysis && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800/80 text-center">
              <div className="text-[10px] text-zinc-400 uppercase font-medium">Original Video</div>
              <div className="text-xs font-mono font-bold text-zinc-200">{analysis.originalDuration}s</div>
            </div>

            <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-medium">Cleaned Clip</div>
              <div className="text-xs font-mono font-bold text-emerald-300">{analysis.cleanedDuration}s</div>
            </div>

            <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-800/50 text-center">
              <div className="text-[10px] text-rose-400 uppercase font-medium">Pauses Eliminated</div>
              <div className="text-xs font-mono font-bold text-rose-300">
                {analysis.silences.filter((s) => s.enabled).length} pauses (-{analysis.timeSaved}s)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Silence Inspector */}
      {activeSilence && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
          <div className="flex items-center space-x-2">
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-zinc-200">
              Pause from {activeSilence.start}s to {activeSilence.end}s
            </span>
            <span className="font-mono text-[10px] text-zinc-400">({activeSilence.duration}s duration)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleSilence(activeSilence.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeSilence.enabled
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {activeSilence.enabled ? '✂ Cut Out' : '✓ Kept in Video'}
            </button>
          </div>
        </div>
      )}

      {/* Detection Tuning Sliders */}
      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-300">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Detection Sensitivity</span>
          </div>
          <button
            onClick={() => {
              setThresholdDb(-32);
              setMinDuration(0.4);
              setPadding(0.08);
            }}
            className="text-[10px] text-zinc-400 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Silence Threshold Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Silence Volume Threshold:</span>
            <span className="font-mono text-amber-400 font-bold">{thresholdDb} dB</span>
          </div>
          <input
            type="range"
            min={-50}
            max={-15}
            step={1}
            value={thresholdDb}
            onChange={(e) => setThresholdDb(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>-50dB (Strict silence only)</span>
            <span>-32dB (Balanced)</span>
            <span>-15dB (Aggressive)</span>
          </div>
        </div>

        {/* Min Duration & Speech Padding */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-400">Min Pause Length:</span>
              <span className="font-mono text-zinc-200 font-bold">{minDuration}s</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.5}
              step={0.05}
              value={minDuration}
              onChange={(e) => setMinDuration(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-400">Speech Cushion (Padding):</span>
              <span className="font-mono text-zinc-200 font-bold">{padding}s</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.2}
              step={0.01}
              value={padding}
              onChange={(e) => setPadding(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Audition & Playback Controls */}
      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <div className="text-[10px] text-zinc-400 flex flex-col">
            <span className="font-semibold text-zinc-300">Audition Mode:</span>
            <span className="text-amber-400 font-mono">
              {auditionMode === 'jump-cut' ? '⚡ Jump-Cut Clean' : auditionMode === 'silence-only' ? '✂ Pauses Only' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Audition Mode Tabs */}
        <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setAuditionMode('jump-cut')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              auditionMode === 'jump-cut'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cleaned Video
          </button>
          <button
            onClick={() => setAuditionMode('silence-only')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              auditionMode === 'silence-only'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pauses Only
          </button>
          <button
            onClick={() => setAuditionMode('normal')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              auditionMode === 'normal'
                ? 'bg-zinc-800 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Raw Video
          </button>
        </div>
      </div>

      {/* Action Buttons: Apply to Editor & Live Mode */}
      <div className="flex items-center space-x-2 pt-1">
        {/* Toggle Live Skip in Editor */}
        <button
          onClick={() => {
            if (analysis) {
              onToggleLiveSkip(!isLiveSkipActive, analysis.silences.filter((s) => s.enabled));
            }
          }}
          className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            isLiveSkipActive
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-xs'
              : 'bg-zinc-800 border-zinc-700/80 text-zinc-300 hover:bg-zinc-700'
          }`}
          title="Toggle live jumping over pauses during playback in the editor"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{isLiveSkipActive ? 'Live Jump: ON' : 'Live Jump'}</span>
        </button>

        {/* Primary: Present Cleaned Clip in Editor */}
        <button
          id="btn-apply-autocut"
          onClick={handleApply}
          disabled={isProcessingCut || !analysis}
          className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessingCut ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Splicing Cleaned Clip...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Apply to Editor ({analysis?.cleanedDuration || duration}s)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
