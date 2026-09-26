/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { DeviceSimulator } from './components/DeviceSimulator.tsx';
import { Header } from './components/Header.tsx';
import { VideoPlayerPreview } from './components/VideoPlayerPreview.tsx';
import { ToolGrid } from './components/ToolGrid.tsx';
import { TrimTool } from './components/tools/TrimTool.tsx';
import { CropTool } from './components/tools/CropTool.tsx';
import { FilterTool } from './components/tools/FilterTool.tsx';
import { AudioMixerTool } from './components/tools/AudioMixerTool.tsx';
import { SpeedTool } from './components/tools/SpeedTool.tsx';
import { TransformTool } from './components/tools/TransformTool.tsx';
import { CompressorTool } from './components/tools/CompressorTool.tsx';
import { ExtractAudioTool } from './components/tools/ExtractAudioTool.tsx';
import { WatermarkTool } from './components/tools/WatermarkTool.tsx';
import { SlideshowTool } from './components/tools/SlideshowTool.tsx';
import { VideoJoinerTool } from './components/tools/VideoJoinerTool.tsx';
import { TransitionTool } from './components/tools/TransitionTool.tsx';
import { SubtitleTool } from './components/tools/SubtitleTool.tsx';
import { StickersTool } from './components/tools/StickersTool.tsx';
import { AutoCutTool } from './components/tools/AutoCutTool.tsx';
import { ExportProgressModal } from './components/ExportProgressModal.tsx';
import { MyStudioModal } from './components/MyStudioModal.tsx';
import { CameraRecorderModal } from './components/CameraRecorderModal.tsx';
import { VideoPickerModal } from './components/VideoPickerModal.tsx';
import { TemplateModal } from './components/TemplateModal.tsx';
import { BgRemoverModal } from './components/BgRemoverModal.tsx';
import { FontGeneratorModal } from './components/FontGeneratorModal.tsx';
import { StudioFooter } from './components/StudioFooter.tsx';

import {
  ToolType,
  VideoAsset,
  TransformSettings,
  AudioSettings,
  WatermarkSettings,
  CompressionSettings,
  AspectRatioType,
  FilterType,
  FilterPreset,
  ExportedItem,
  CustomCropSettings,
  FontGeneratorSettings,
  ExportConfig,
  VideoTemplate,
  TikTokSong,
  CanvasBackgroundType,
  EditorStateSnapshot,
  TransitionSettings,
  SubtitleStyleSettings,
  StickerOverlayItem,
  SilenceInterval,
  SpeechInterval,
} from './types.ts';
import { SAMPLE_VIDEOS, FILTERS } from './data/sampleMedia.ts';
import { exportEditedVideo, joinVideosWithTransitions, cutVideoSilence, ExportResult } from './utils/videoProcessor.ts';
import { generateSyntheticVideoBlob } from './utils/sampleVideoFallback.ts';

const STORAGE_KEY = 'vivvyo_editor_saved_items_v2';

export default function App() {
  const [currentVideo, setCurrentVideo] = useState<VideoAsset>(SAMPLE_VIDEOS[0]);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  // Playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentVideo.duration);
  const [isPlaying, setIsPlaying] = useState(false);

  // Tool settings
  const [trimRange, setTrimRange] = useState<[number, number]>([0, currentVideo.duration]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('original');
  const [customCrop, setCustomCrop] = useState<CustomCropSettings>({
    widthRatio: 16,
    heightRatio: 9,
    freeform: false,
  });
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [filterCss, setFilterCss] = useState('none');
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [canvasBackground, setCanvasBackground] = useState<CanvasBackgroundType>('black');
  const [transform, setTransform] = useState<TransformSettings>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    muted: false,
    videoVolume: 1,
    bgmTrackId: null,
    bgmVolume: 0.6,
  });
  const [speed, setSpeed] = useState(1);
  const [watermark, setWatermark] = useState<WatermarkSettings>({
    text: '',
    position: 'bottom-right',
    color: '#ffffff',
    opacity: 0.85,
    fontSize: 24,
    hasBackground: true,
  });
  const [compression, setCompression] = useState<CompressionSettings>({
    targetResolution: '720p',
    quality: 'medium',
  });

  // Font & text generator state
  const [fontGenerator, setFontGenerator] = useState<FontGeneratorSettings>({
    text: '',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 32,
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 3,
    effect: 'stroke',
    glowColor: '#00f0ff',
    glowIntensity: 15,
    bgPill: false,
    pillColor: '#000000cc',
    positionY: 75,
  });

  // Background remover cutout sticker
  const [bgStickerUrl, setBgStickerUrl] = useState<string | null>(null);

  // Transitions Settings (Between clips or scene transitions)
  const [transitionSettings, setTransitionSettings] = useState<TransitionSettings>({
    type: 'cross-dissolve',
    duration: 0.8,
    easing: 'ease-in-out',
    soundFx: 'whoosh',
  });

  // Subtitles and Viral Captions
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleStyleSettings>({
    enabled: false,
    preset: 'hormozi',
    fontSize: 24,
    position: 'bottom',
    primaryColor: '#ffffff',
    highlightColor: '#eab308',
    hasBackground: true,
    items: [],
  });

  // Stickers & Reactions Overlay
  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlayItem[]>([]);

  // Auto-Cut Silence Jump State
  const [isLiveSkipActive, setIsLiveSkipActive] = useState<boolean>(false);
  const [silenceSkipIntervals, setSilenceSkipIntervals] = useState<SilenceInterval[]>([]);

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<EditorStateSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorStateSnapshot[]>([]);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Helper to record a state snapshot before mutation
  const takeSnapshot = (label: string) => {
    const snap: EditorStateSnapshot = {
      activeFilter: filterType,
      filterIntensity,
      transform: { ...transform },
      audioSettings: { ...audioSettings },
      aspectRatio,
      customCrop: { ...customCrop },
      speed,
      trimRange: [...trimRange] as [number, number],
      watermark: { ...watermark },
      fontGenerator: { ...fontGenerator },
      bgStickerUrl,
      canvasBackground,
      transition: { ...transitionSettings },
      subtitles: { ...subtitleSettings, items: [...subtitleSettings.items] },
      stickers: [...stickerOverlays],
      label,
      timestamp: Date.now(),
    };

    setUndoStack((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (Date.now() - last.timestamp < 350 && last.label === label) {
          return prev;
        }
      }
      return [...prev.slice(-35), snap];
    });
    setRedoStack([]);
  };

  // Restore snapshot helper
  const applySnapshot = (snap: EditorStateSnapshot) => {
    setFilterType(snap.activeFilter);
    const filterObj = FILTERS.find((f: FilterPreset) => f.id === snap.activeFilter);
    setFilterCss(filterObj ? filterObj.cssFilter : 'none');
    setFilterIntensity(snap.filterIntensity ?? 100);
    setTransform(snap.transform);
    setAudioSettings(snap.audioSettings);
    setAspectRatio(snap.aspectRatio);
    setCustomCrop(snap.customCrop);
    setSpeed(snap.speed);
    setTrimRange(snap.trimRange);
    setWatermark(snap.watermark);
    setFontGenerator(snap.fontGenerator);
    setBgStickerUrl(snap.bgStickerUrl);
    setCanvasBackground(snap.canvasBackground ?? 'black');
    if (snap.transition) setTransitionSettings(snap.transition);
    if (snap.subtitles) setSubtitleSettings(snap.subtitles);
    if (snap.stickers) setStickerOverlays(snap.stickers);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const currentSnapshot: EditorStateSnapshot = {
      activeFilter: filterType,
      filterIntensity,
      transform: { ...transform },
      audioSettings: { ...audioSettings },
      aspectRatio,
      customCrop: { ...customCrop },
      speed,
      trimRange: [...trimRange] as [number, number],
      watermark: { ...watermark },
      fontGenerator: { ...fontGenerator },
      bgStickerUrl,
      canvasBackground,
      transition: { ...transitionSettings },
      subtitles: { ...subtitleSettings, items: [...subtitleSettings.items] },
      stickers: [...stickerOverlays],
      label: 'Current Edit',
      timestamp: Date.now(),
    };

    const previousSnapshot = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((prev) => [...prev, currentSnapshot]);
    setUndoStack(newUndoStack);

    applySnapshot(previousSnapshot);
    showToast(`Undid: ${previousSnapshot.label}`);
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const currentSnapshot: EditorStateSnapshot = {
      activeFilter: filterType,
      filterIntensity,
      transform: { ...transform },
      audioSettings: { ...audioSettings },
      aspectRatio,
      customCrop: { ...customCrop },
      speed,
      trimRange: [...trimRange] as [number, number],
      watermark: { ...watermark },
      fontGenerator: { ...fontGenerator },
      bgStickerUrl,
      canvasBackground,
      transition: { ...transitionSettings },
      subtitles: { ...subtitleSettings, items: [...subtitleSettings.items] },
      stickers: [...stickerOverlays],
      label: 'Current Edit',
      timestamp: Date.now(),
    };

    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((prev) => [...prev, currentSnapshot]);
    setRedoStack(newRedoStack);

    applySnapshot(nextSnapshot);
    showToast(`Redid: ${nextSnapshot.label}`);
  };

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, filterType, filterIntensity, transform, audioSettings, aspectRatio, customCrop, speed, trimRange, watermark, fontGenerator, bgStickerUrl, canvasBackground]);

  // Modals state
  const [savedItems, setSavedItems] = useState<ExportedItem[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);
  const [isFontGeneratorOpen, setIsFontGeneratorOpen] = useState(false);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProcessingExport, setIsProcessingExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [activeExportTitle, setActiveExportTitle] = useState('Vivvyo Video');

  // Save items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [savedItems]);

  // When currentVideo changes, update duration and trim range
  useEffect(() => {
    setDuration(currentVideo.duration);
    setTrimRange([0, currentVideo.duration]);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [currentVideo]);

  // Video element event listeners to sync duration if metadata loads
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoadedMetadata = () => {
      if (v.duration && !isNaN(v.duration) && v.duration > 0) {
        setDuration(v.duration);
        setTrimRange([0, v.duration]);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [currentVideo]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  };

  const handleCustomVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const asset: VideoAsset = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: Math.max(1, Math.round(tempVideo.duration || 15)),
        width: tempVideo.videoWidth || 1280,
        height: tempVideo.videoHeight || 720,
        sizeBytes: file.size,
        isCustomUpload: true,
      };
      setCurrentVideo(asset);
      showToast(`Imported "${asset.title}" from device`);
    };
  };

  const handleVideoRecorded = (recordedAsset: VideoAsset) => {
    setCurrentVideo(recordedAsset);
    showToast(`Camera recording loaded!`);
  };

  const failedUrlsRef = useRef<Set<string>>(new Set());

  const handleVideoError = async () => {
    failedUrlsRef.current.add(currentVideo.url);

    // If the active video fails to load, try next untried sample video first
    if (!currentVideo.isCustomUpload) {
      const untriedSample = SAMPLE_VIDEOS.find((v) => !failedUrlsRef.current.has(v.url));
      if (untriedSample) {
        showToast(`Switching to backup footage: "${untriedSample.title}"...`);
        setCurrentVideo(untriedSample);
        return;
      }
    }

    // Otherwise generate an immediate synthetic offline video clip
    showToast('Loading studio backup video clip...');
    try {
      const synthUrl = await generateSyntheticVideoBlob();
      if (synthUrl) {
        setCurrentVideo({
          id: `synth-${Date.now()}`,
          title: 'Vivvyo Studio Demo',
          url: synthUrl,
          duration: 2,
          width: 640,
          height: 360,
          isCustomUpload: true,
        });
        showToast('Loaded offline studio clip!');
      }
    } catch (err) {
      console.warn('Fallback synthetic video error:', err);
    }
  };

  // Open Export Modal directly
  const handleOpenExportDialog = (toolTitle = 'Vivvyo Edit') => {
    setActiveExportTitle(toolTitle);
    setExportResult(null);
    setExportProgress(0);
    setIsProcessingExport(false);
    setIsExportModalOpen(true);
  };

  // Process final export with user's selected format and compression options
  const handleStartFinalExport = async (config: ExportConfig) => {
    if (!videoRef.current) return;
    try {
      setIsProcessingExport(true);
      setExportProgress(5);
      setExportResult(null);

      const result = await exportEditedVideo({
        videoElement: videoRef.current,
        startTime: trimRange[0],
        endTime: trimRange[1],
        speed,
        aspectRatio,
        customCrop,
        filterCss,
        filterIntensity,
        canvasBackground,
        transform,
        watermark,
        fontGenerator,
        subtitles: subtitleSettings,
        stickers: stickerOverlays,
        audio: audioSettings,
        compression: {
          targetResolution: config.resolution as any,
          quality: config.quality,
        },
        outputFormat: config.format,
        autoCompress: config.autoCompress,
        onProgress: (pct) => setExportProgress(pct),
      });

      setExportResult(result);
      setIsProcessingExport(false);

      // Save to My Studio list
      const newItem: ExportedItem = {
        id: `export-${Date.now()}`,
        title: `${currentVideo.title} (${activeExportTitle})`,
        type: 'video',
        blobUrl: result.blobUrl,
        blobSize: result.sizeBytes,
        duration: result.duration,
        createdAt: Date.now(),
        format: config.format.toLowerCase(),
        toolUsed: activeExportTitle,
      };
      setSavedItems((prev) => [newItem, ...prev]);
      showToast(`Export complete: ${result.filename || 'video.' + config.format}`);
    } catch (err) {
      console.error('Export failed', err);
      setIsProcessingExport(false);
      showToast('Export failed. Please check browser permissions and retry.');
    }
  };

  const handleAudioExtracted = (blob: Blob, url: string, audioDuration: number) => {
    const newItem: ExportedItem = {
      id: `audio-${Date.now()}`,
      title: `${currentVideo.title} (Audio)`,
      type: 'audio',
      blobUrl: url,
      blobSize: blob.size,
      duration: audioDuration,
      createdAt: Date.now(),
      format: 'wav',
      toolUsed: 'Audio Extractor',
    };
    setSavedItems((prev) => [newItem, ...prev]);
    showToast('Audio extracted to WAV/MP3!');
  };

  const handleSlideshowCreated = (blob: Blob, url: string, slideDuration: number) => {
    const newItem: ExportedItem = {
      id: `slideshow-${Date.now()}`,
      title: `Photo Slideshow (${Math.round(slideDuration)}s)`,
      type: 'video',
      blobUrl: url,
      blobSize: blob.size,
      duration: slideDuration,
      createdAt: Date.now(),
      format: blob.type.includes('mp4') ? 'mp4' : 'webm',
      toolUsed: 'Slideshow Maker',
    };
    setSavedItems((prev) => [newItem, ...prev]);
    setExportResult({
      blob,
      blobUrl: url,
      duration: slideDuration,
      sizeBytes: blob.size,
      mimeType: blob.type,
      filename: `slideshow-${Date.now()}.mp4`,
    });
    setIsExportModalOpen(true);
    showToast('Slideshow video created!');
  };

  const handleJoinedVideos = async (clips: VideoAsset[], transitions: TransitionSettings[]) => {
    setActiveExportTitle('Joined Clip Sequence');
    setIsExportModalOpen(true);
    setIsProcessingExport(true);
    setExportProgress(10);
    setExportResult(null);

    try {
      const res = await joinVideosWithTransitions(clips, transitions, (pct) => {
        setExportProgress(pct);
      });
      setExportResult(res);
      setIsProcessingExport(false);

      const newItem: ExportedItem = {
        id: `sequence-${Date.now()}`,
        title: `Joined Sequence (${clips.length} Clips)`,
        type: 'video',
        blobUrl: res.blobUrl,
        blobSize: res.sizeBytes,
        duration: res.duration,
        createdAt: Date.now(),
        format: 'mp4',
        toolUsed: 'Video Joiner & Transitions',
      };
      setSavedItems((prev) => [newItem, ...prev]);
      showToast(`Merged ${clips.length} clips with seamless transitions!`);
    } catch (err) {
      console.error('Sequence join failed', err);
      setIsProcessingExport(false);
      showToast('Joining sequence failed. Please try again.');
    }
  };

  const handleApplyAutoCutCleanedClip = async (
    speechSegments: SpeechInterval[],
    silences: SilenceInterval[],
    cleanedDuration: number
  ) => {
    setActiveExportTitle('Auto-Cut Jump-Cut Video');
    setIsExportModalOpen(true);
    setIsProcessingExport(true);
    setExportProgress(15);
    setExportResult(null);

    try {
      const res = await cutVideoSilence(currentVideo, speechSegments, (pct) => {
        setExportProgress(Math.max(15, pct));
      });

      setExportResult(res);
      setIsProcessingExport(false);

      const cleanedAsset: VideoAsset = {
        id: `autocut-${Date.now()}`,
        title: `${currentVideo.title} (Cleaned)`,
        url: res.blobUrl,
        duration: res.duration,
        width: currentVideo.width,
        height: currentVideo.height,
        sizeBytes: res.sizeBytes,
        isCustomUpload: true,
      };

      // Add to snapshot history
      takeSnapshot('Auto-Cut Pauses');

      // Present the cleaned clip directly in the editor!
      setCurrentVideo(cleanedAsset);
      setDuration(res.duration);
      setTrimRange([0, res.duration]);
      setCurrentTime(0);
      setIsLiveSkipActive(false);
      setSilenceSkipIntervals([]);
      setActiveTool(null);

      // Save to My Studio list
      const newItem: ExportedItem = {
        id: cleanedAsset.id,
        title: cleanedAsset.title,
        type: 'video',
        blobUrl: res.blobUrl,
        blobSize: res.sizeBytes,
        duration: res.duration,
        createdAt: Date.now(),
        format: res.format || 'mp4',
        toolUsed: 'Auto-Cut Silence',
      };
      setSavedItems((prev) => [newItem, ...prev]);

      showToast(`🎉 Cleaned clip (${res.duration}s) presented in editor! Removed ${silences.length} pauses.`);
    } catch (err) {
      console.error('Auto-Cut processing failed', err);
      setIsProcessingExport(false);
      showToast('Fast export encountered an issue; enabled live jump-cut mode in player.');
      setIsLiveSkipActive(true);
      setSilenceSkipIntervals(silences);
      setIsExportModalOpen(false);
    }
  };

  const handleDeleteSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllSaved = () => {
    setSavedItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Tool activation handler
  const handleSelectTool = (tool: ToolType) => {
    if (tool === 'templates') {
      setIsTemplateModalOpen(true);
    } else if (tool === 'bg-remove') {
      setIsBgRemoverOpen(true);
    } else if (tool === 'font-generator') {
      setIsFontGeneratorOpen(true);
    } else {
      setActiveTool(tool);
    }
  };

  // Template apply handler
  const handleApplyTemplate = (template: VideoTemplate, song?: TikTokSong) => {
    takeSnapshot(`Template: ${template.title}`);
    setAspectRatio(template.aspectRatio);
    setFilterType(template.filterId);

    const filterObj = FILTERS.find((f: FilterPreset) => f.id === template.filterId);
    if (filterObj) {
      setFilterCss(filterObj.cssFilter);
    }

    setSpeed(template.speed);
    setAudioSettings((prev) => ({
      ...prev,
      bgmTrackId: song?.id || template.songId,
      bgmVolume: 0.7,
    }));

    if (template.sampleText) {
      setFontGenerator((prev) => ({
        ...prev,
        text: template.sampleText || '',
        fontFamily: "'Montserrat', sans-serif",
      }));
    }

    showToast(`Applied "${template.title}" template!`);
  };

  // TikTok song select handler from TemplateModal
  const handleSelectTikTokSong = (song: TikTokSong) => {
    takeSnapshot(`Audio: ${song.title}`);
    setAudioSettings((prev) => ({
      ...prev,
      bgmTrackId: song.id,
      bgmVolume: 0.7,
    }));
    showToast(`Selected audio: ${song.title}`);
  };

  return (
    <DeviceSimulator>
      {/* App Header with Logo & Quick Actions */}
      <Header
        activeTool={activeTool}
        onBack={() => setActiveTool(null)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenVideoPicker={() => setIsVideoPickerOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onTriggerExport={() => handleOpenExportDialog('Video Project')}
        savedCount={savedItems.length}
        currentVideoTitle={currentVideo.title}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        undoCount={undoStack.length}
        redoCount={redoStack.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-indigo-500/50 text-white text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Video Player Preview with Live Overlays */}
      <VideoPlayerPreview
        video={currentVideo}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTimeUpdate={(t) => setCurrentTime(t)}
        onTogglePlay={handleTogglePlay}
        videoRef={videoRef}
        filterCss={filterCss}
        filterIntensity={filterIntensity}
        transform={transform}
        watermark={watermark}
        fontGenerator={fontGenerator}
        bgStickerUrl={bgStickerUrl}
        subtitles={subtitleSettings}
        stickers={stickerOverlays}
        audio={audioSettings}
        aspectRatio={aspectRatio}
        customCrop={customCrop}
        canvasBackground={canvasBackground}
        speed={speed}
        trimRange={activeTool === 'trim' ? trimRange : undefined}
        onVideoError={handleVideoError}
        isLiveSkipActive={isLiveSkipActive}
        silenceSkipIntervals={silenceSkipIntervals}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {activeTool === null && (
          <ToolGrid
            onSelectTool={handleSelectTool}
            activeTool={activeTool}
          />
        )}

        {/* Specialized Tool Workspaces */}
        {activeTool === 'trim' && (
          <div className="flex-1 flex flex-col justify-end">
            <TrimTool
              duration={duration}
              trimRange={trimRange}
              onTrimChange={(range) => {
                takeSnapshot('Trim Range');
                setTrimRange(range);
              }}
              onPreviewTrim={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = trimRange[0];
                  videoRef.current.play();
                }
              }}
              onApplyTrim={() => handleOpenExportDialog('Trim Clip')}
              onReset={() => {
                takeSnapshot('Reset Trim');
                setTrimRange([0, duration]);
              }}
              onOpenAutoCut={() => setActiveTool('auto-cut')}
            />
          </div>
        )}

        {activeTool === 'auto-cut' && (
          <div className="flex-1 flex flex-col justify-end">
            <AutoCutTool
              currentVideo={currentVideo}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={(time) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              onTogglePlay={handleTogglePlay}
              onApplyCleanedClip={handleApplyAutoCutCleanedClip}
              onToggleLiveSkip={(enabled, silences) => {
                setIsLiveSkipActive(enabled);
                setSilenceSkipIntervals(silences);
                if (enabled) {
                  showToast('⚡ Live Auto-Cut jump enabled in editor!');
                } else {
                  showToast('Live Auto-Cut jump disabled.');
                }
              }}
              isLiveSkipActive={isLiveSkipActive}
            />
          </div>
        )}

        {activeTool === 'crop' && (
          <div className="flex-1 flex flex-col justify-end">
            <CropTool
              currentRatio={aspectRatio}
              customCrop={customCrop}
              canvasBackground={canvasBackground}
              onSelectRatio={(r) => {
                takeSnapshot('Aspect Ratio');
                setAspectRatio(r);
              }}
              onSelectCanvasBackground={(bg) => {
                takeSnapshot('Canvas Backdrop');
                setCanvasBackground(bg);
              }}
              onUpdateCustomCrop={(c) => {
                takeSnapshot('Custom Crop');
                setCustomCrop(c);
              }}
              onApplyCrop={() => handleOpenExportDialog('Crop Ratio')}
              onReset={() => {
                takeSnapshot('Reset Crop');
                setAspectRatio('original');
                setCanvasBackground('black');
                setCustomCrop({ widthRatio: 16, heightRatio: 9, freeform: false });
              }}
            />
          </div>
        )}

        {activeTool === 'filter' && (
          <div className="flex-1 flex flex-col justify-end">
            <FilterTool
              currentFilter={filterType}
              intensity={filterIntensity}
              onSelectFilter={(id, css) => {
                takeSnapshot('Filter: ' + id);
                setFilterType(id);
                setFilterCss(css);
              }}
              onIntensityChange={(val) => {
                setFilterIntensity(val);
              }}
              onApplyFilter={() => handleOpenExportDialog('Color Filter')}
              onReset={() => {
                takeSnapshot('Reset Filter');
                setFilterType('none');
                setFilterCss('none');
                setFilterIntensity(100);
              }}
            />
          </div>
        )}

        {activeTool === 'audio' && (
          <div className="flex-1 flex flex-col justify-end">
            <AudioMixerTool
              audioSettings={audioSettings}
              onChangeAudio={(s) => {
                takeSnapshot('Audio Mixer');
                setAudioSettings(s);
              }}
              onApplyAudio={() => handleOpenExportDialog('Audio Mixer')}
              onReset={() => {
                takeSnapshot('Reset Audio');
                setAudioSettings({
                  muted: false,
                  videoVolume: 1,
                  bgmTrackId: null,
                  bgmVolume: 0.6,
                });
              }}
            />
          </div>
        )}

        {activeTool === 'speed' && (
          <div className="flex-1 flex flex-col justify-end">
            <SpeedTool
              currentSpeed={speed}
              originalDuration={duration}
              onSelectSpeed={(s) => {
                takeSnapshot(`Speed: ${s}x`);
                setSpeed(s);
              }}
              onApplySpeed={() => handleOpenExportDialog('Speed Edit')}
              onReset={() => {
                takeSnapshot('Reset Speed');
                setSpeed(1);
              }}
            />
          </div>
        )}

        {activeTool === 'transform' && (
          <div className="flex-1 flex flex-col justify-end">
            <TransformTool
              transform={transform}
              onChangeTransform={(t) => {
                takeSnapshot('Transform');
                setTransform(t);
              }}
              onApplyTransform={() => handleOpenExportDialog('Rotate & Mirror')}
              onReset={() => {
                takeSnapshot('Reset Transform');
                setTransform({
                  rotation: 0,
                  flipHorizontal: false,
                  flipVertical: false,
                });
              }}
            />
          </div>
        )}

        {activeTool === 'compress' && (
          <div className="flex-1 flex flex-col justify-end">
            <CompressorTool
              settings={compression}
              duration={duration}
              originalSizeBytes={currentVideo.sizeBytes}
              onChangeSettings={(s) => setCompression(s)}
              onApplyCompress={() => handleOpenExportDialog('Compressed Video')}
            />
          </div>
        )}

        {activeTool === 'extract-audio' && (
          <div className="flex-1 flex flex-col justify-end">
            <ExtractAudioTool
              videoUrl={currentVideo.url}
              videoTitle={currentVideo.title}
              duration={duration}
              onAudioExtracted={handleAudioExtracted}
            />
          </div>
        )}

        {activeTool === 'watermark' && (
          <div className="flex-1 flex flex-col justify-end">
            <WatermarkTool
              watermark={watermark}
              onChangeWatermark={(w) => {
                takeSnapshot('Watermark');
                setWatermark(w);
              }}
              onApplyWatermark={() => handleOpenExportDialog('Watermark Video')}
              onReset={() => {
                takeSnapshot('Reset Watermark');
                setWatermark({
                  text: '',
                  position: 'bottom-right',
                  color: '#ffffff',
                  opacity: 0.85,
                  fontSize: 24,
                  hasBackground: true,
                });
              }}
            />
          </div>
        )}

        {activeTool === 'slideshow' && (
          <div className="flex-1 flex flex-col justify-end">
            <SlideshowTool onSlideshowCreated={handleSlideshowCreated} />
          </div>
        )}

        {activeTool === 'joiner' && (
          <div className="flex-1 flex flex-col justify-end">
            <VideoJoinerTool
              currentVideo={currentVideo}
              onJoinVideos={handleJoinedVideos}
              onOpenTransitionTool={() => setActiveTool('transition')}
            />
          </div>
        )}

        {activeTool === 'transition' && (
          <div className="flex-1 flex flex-col justify-end">
            <TransitionTool
              settings={transitionSettings}
              onChangeSettings={(s) => {
                takeSnapshot('Transition FX');
                setTransitionSettings(s);
              }}
              currentVideo={currentVideo}
              onOpenJoiner={() => setActiveTool('joiner')}
              onApplyToJoiner={() => {
                showToast(`Transition set to ${transitionSettings.type}!`);
                setActiveTool('joiner');
              }}
              onReset={() => {
                takeSnapshot('Reset Transition');
                setTransitionSettings({
                  type: 'cross-dissolve',
                  duration: 0.8,
                  easing: 'ease-in-out',
                  soundFx: 'whoosh',
                });
              }}
            />
          </div>
        )}

        {activeTool === 'subtitles' && (
          <div className="flex-1 flex flex-col justify-end">
            <SubtitleTool
              settings={subtitleSettings}
              onChangeSettings={(s) => {
                takeSnapshot('Captions');
                setSubtitleSettings(s);
              }}
              videoDuration={duration}
              currentTime={currentTime}
              onSeek={(time) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              onApply={() => handleOpenExportDialog('Captioned Video')}
              onReset={() => {
                takeSnapshot('Reset Subtitles');
                setSubtitleSettings({
                  enabled: false,
                  preset: 'hormozi',
                  fontSize: 24,
                  position: 'bottom',
                  primaryColor: '#ffffff',
                  highlightColor: '#eab308',
                  hasBackground: true,
                  items: [],
                });
              }}
            />
          </div>
        )}

        {activeTool === 'stickers' && (
          <div className="flex-1 flex flex-col justify-end">
            <StickersTool
              stickers={stickerOverlays}
              onChangeStickers={(stks) => {
                takeSnapshot('Stickers');
                setStickerOverlays(stks);
              }}
              onApply={() => handleOpenExportDialog('Stickers Video')}
              onReset={() => {
                takeSnapshot('Clear Stickers');
                setStickerOverlays([]);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Branding with Vivvyo Copyright & Browser Link */}
      <StudioFooter
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        undoCount={undoStack.length}
        redoCount={redoStack.length}
        lastAction={undoStack.length > 0 ? undoStack[undoStack.length - 1].label : undefined}
      />

      {/* Global Modals & Sheets */}
      <ExportProgressModal
        isOpen={isExportModalOpen}
        isProcessing={isProcessingExport}
        progress={exportProgress}
        result={exportResult}
        toolTitle={activeExportTitle}
        duration={duration}
        onClose={() => setIsExportModalOpen(false)}
        onStartExport={handleStartFinalExport}
        onOpenStudio={() => {
          setIsExportModalOpen(false);
          setIsStudioOpen(true);
        }}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        onSelectSong={handleSelectTikTokSong}
      />

      <BgRemoverModal
        isOpen={isBgRemoverOpen}
        onClose={() => setIsBgRemoverOpen(false)}
        onApplyAsSticker={(stickerUrl: string) => {
          takeSnapshot('Cutout Sticker');
          setBgStickerUrl(stickerUrl);
          showToast('Cutout sticker placed on video!');
        }}
      />

      <FontGeneratorModal
        isOpen={isFontGeneratorOpen}
        onClose={() => setIsFontGeneratorOpen(false)}
        currentSettings={fontGenerator}
        onApply={(newSettings) => {
          takeSnapshot('Text Overlay');
          setFontGenerator(newSettings);
          showToast('Text overlay updated!');
        }}
      />

      <MyStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        items={savedItems}
        onDeleteItem={handleDeleteSavedItem}
        onClearAll={handleClearAllSaved}
      />

      <CameraRecorderModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onVideoRecorded={handleVideoRecorded}
      />

      <VideoPickerModal
        isOpen={isVideoPickerOpen}
        onClose={() => setIsVideoPickerOpen(false)}
        currentVideoId={currentVideo.id}
        onSelectVideo={(v) => setCurrentVideo(v)}
        onUploadCustomVideo={handleCustomVideoUpload}
      />
    </DeviceSimulator>
  );
}
