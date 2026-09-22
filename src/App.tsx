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
import { ExportProgressModal } from './components/ExportProgressModal.tsx';
import { MyStudioModal } from './components/MyStudioModal.tsx';
import { CameraRecorderModal } from './components/CameraRecorderModal.tsx';
import { VideoPickerModal } from './components/VideoPickerModal.tsx';
import { TemplateModal } from './components/TemplateModal.tsx';
import { BgRemoverModal } from './components/BgRemoverModal.tsx';
import { FontGeneratorModal } from './components/FontGeneratorModal.tsx';

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
} from './types.ts';
import { SAMPLE_VIDEOS, FILTERS } from './data/sampleMedia.ts';
import { exportEditedVideo, ExportResult } from './utils/videoProcessor.ts';
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

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

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

  const handleVideoError = async () => {
    // If the active video fails to load, try next verified sample video first
    const otherSample = SAMPLE_VIDEOS.find((v) => v.url !== currentVideo.url);
    if (otherSample && !currentVideo.isCustomUpload) {
      showToast(`Source blocked. Switching to "${otherSample.title}"...`);
      setCurrentVideo(otherSample);
      return;
    }

    // Otherwise generate an immediate synthetic video blob
    showToast('Generating offline studio demo clip...');
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
        transform,
        watermark,
        fontGenerator,
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

  const handleJoinedVideos = (clips: VideoAsset[]) => {
    const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);
    // Switch to first clip and notify
    if (clips.length > 0) {
      setCurrentVideo(clips[0]);
    }
    showToast(`Merged sequence of ${clips.length} clips ready (${Math.round(totalDuration)}s)!`);
    handleOpenExportDialog('Joined Clips');
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
        transform={transform}
        watermark={watermark}
        fontGenerator={fontGenerator}
        bgStickerUrl={bgStickerUrl}
        audio={audioSettings}
        aspectRatio={aspectRatio}
        customCrop={customCrop}
        speed={speed}
        trimRange={activeTool === 'trim' ? trimRange : undefined}
        onVideoError={handleVideoError}
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
              onTrimChange={(range) => setTrimRange(range)}
              onPreviewTrim={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = trimRange[0];
                  videoRef.current.play();
                }
              }}
              onApplyTrim={() => handleOpenExportDialog('Trim Clip')}
              onReset={() => setTrimRange([0, duration])}
            />
          </div>
        )}

        {activeTool === 'crop' && (
          <div className="flex-1 flex flex-col justify-end">
            <CropTool
              currentRatio={aspectRatio}
              customCrop={customCrop}
              onSelectRatio={(r) => setAspectRatio(r)}
              onUpdateCustomCrop={(c) => setCustomCrop(c)}
              onApplyCrop={() => handleOpenExportDialog('Crop Ratio')}
              onReset={() => {
                setAspectRatio('original');
                setCustomCrop({ widthRatio: 16, heightRatio: 9, freeform: false });
              }}
            />
          </div>
        )}

        {activeTool === 'filter' && (
          <div className="flex-1 flex flex-col justify-end">
            <FilterTool
              currentFilter={filterType}
              onSelectFilter={(id, css) => {
                setFilterType(id);
                setFilterCss(css);
              }}
              onApplyFilter={() => handleOpenExportDialog('Color Filter')}
              onReset={() => {
                setFilterType('none');
                setFilterCss('none');
              }}
            />
          </div>
        )}

        {activeTool === 'audio' && (
          <div className="flex-1 flex flex-col justify-end">
            <AudioMixerTool
              audioSettings={audioSettings}
              onChangeAudio={(s) => setAudioSettings(s)}
              onApplyAudio={() => handleOpenExportDialog('Audio Mixer')}
              onReset={() =>
                setAudioSettings({
                  muted: false,
                  videoVolume: 1,
                  bgmTrackId: null,
                  bgmVolume: 0.6,
                })
              }
            />
          </div>
        )}

        {activeTool === 'speed' && (
          <div className="flex-1 flex flex-col justify-end">
            <SpeedTool
              currentSpeed={speed}
              originalDuration={duration}
              onSelectSpeed={(s) => setSpeed(s)}
              onApplySpeed={() => handleOpenExportDialog('Speed Edit')}
              onReset={() => setSpeed(1)}
            />
          </div>
        )}

        {activeTool === 'transform' && (
          <div className="flex-1 flex flex-col justify-end">
            <TransformTool
              transform={transform}
              onChangeTransform={(t) => setTransform(t)}
              onApplyTransform={() => handleOpenExportDialog('Rotate & Mirror')}
              onReset={() =>
                setTransform({
                  rotation: 0,
                  flipHorizontal: false,
                  flipVertical: false,
                })
              }
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
              onChangeWatermark={(w) => setWatermark(w)}
              onApplyWatermark={() => handleOpenExportDialog('Watermark Video')}
              onReset={() =>
                setWatermark({
                  text: '',
                  position: 'bottom-right',
                  color: '#ffffff',
                  opacity: 0.85,
                  fontSize: 24,
                  hasBackground: true,
                })
              }
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
            />
          </div>
        )}
      </div>

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
          setBgStickerUrl(stickerUrl);
          showToast('Cutout sticker placed on video!');
        }}
      />

      <FontGeneratorModal
        isOpen={isFontGeneratorOpen}
        onClose={() => setIsFontGeneratorOpen(false)}
        currentSettings={fontGenerator}
        onApply={(newSettings) => {
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
