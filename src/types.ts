export type ToolType =
  | 'trim'
  | 'crop'
  | 'filter'
  | 'audio'
  | 'speed'
  | 'transform'
  | 'compress'
  | 'extract-audio'
  | 'watermark'
  | 'joiner'
  | 'slideshow'
  | 'templates'
  | 'bg-remove'
  | 'font-generator';

export type FilterType =
  | 'none'
  | 'cinematic'
  | 'warm'
  | 'cool'
  | 'sepia'
  | 'noir'
  | 'cyberpunk'
  | 'invert'
  | 'vivid'
  | 'vintage'
  | 'golden'
  | 'neon-pink'
  | 'pastel'
  | 'vhs-glitch'
  | 'matrix'
  | 'dreamy'
  | 'kodak-gold'
  | 'emerald'
  | 'monochrome-high';

export interface FilterPreset {
  id: FilterType;
  name: string;
  cssFilter: string;
  badgeColor: string;
}

export type AspectRatioType = 'original' | '9:16' | '1:1' | '16:9' | '4:5' | '4:3' | 'custom';

export interface AspectRatioOption {
  id: AspectRatioType;
  label: string;
  sub: string;
  ratio: number | null; // width / height
  iconName: string;
}

export interface CustomCropSettings {
  widthRatio: number;
  heightRatio: number;
  freeform?: boolean;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface TransformSettings {
  rotation: number; // 0, 90, 180, 270
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface AudioSettings {
  muted: boolean;
  videoVolume: number;
  bgmTrackId: string | null;
  bgmVolume: number;
}

export interface WatermarkSettings {
  text: string;
  position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  color: string;
  opacity: number;
  fontSize: number;
  hasBackground: boolean;
}

export interface CompressionSettings {
  targetResolution: '4k' | '1080p' | '720p' | '480p' | '360p';
  quality: 'high' | 'medium' | 'low';
}

export type OutputFormat = 'mp4' | 'mov' | 'webm';

export interface ExportConfig {
  format: OutputFormat;
  autoCompress: boolean;
  resolution: '4k' | '1080p' | '720p' | '480p';
  fps: 24 | 30 | 60;
  quality: 'high' | 'medium' | 'low';
}

export interface VideoAsset {
  id: string;
  title: string;
  url: string;
  duration: number; // seconds
  width: number;
  height: number;
  sizeBytes?: number;
  thumbnailUrl?: string;
  isCustomUpload?: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  genre: string;
  duration: number;
  bpm: number;
  type: 'synth' | 'uploaded' | 'tiktok';
  artist?: string;
  coverUrl?: string;
  views?: string;
}

export interface TikTokSong {
  id: string;
  title: string;
  artist: string;
  category: 'viral' | 'phonk' | 'lofi' | 'speedup' | 'cinematic' | 'dance' | 'aesthetic';
  duration: number;
  bpm: number;
  coverUrl: string;
  views: string;
  previewNoteFreq: number;
  rank?: number;
}

export interface VideoTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: 'viral' | 'aesthetic' | 'travel' | 'fitness' | 'retro' | 'dance';
  previewImageUrl: string;
  songId: string;
  filterId: FilterType;
  aspectRatio: AspectRatioType;
  speed: number;
  sampleText: string;
  fontStyleId: string;
  badge: string;
  isTrending?: boolean;
}

export interface BgRemoverSettings {
  tolerance: number; // 10 - 80
  edgeSmooth: number; // 0 - 10
  backgroundType: 'transparent' | 'color' | 'gradient' | 'blur';
  bgColor: string;
  bgGradient: string;
}

export interface FontGeneratorSettings {
  text: string;
  fontFamily: string;
  fontStyleId?: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  glowColor?: string;
  glowIntensity?: number;
  effect: 'none' | 'glow' | 'stroke' | 'shadow' | 'gradient' | '3d' | 'vhs' | 'comic' | 'bubble';
  bgPill: boolean;
  pillColor: string;
  positionY: number; // 10 to 90 %
  letterSpacing?: number;
  animation?: 'none' | 'fade' | 'pop' | 'typewriter' | 'pulse';
}

export interface ExportedItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'image';
  blobUrl: string;
  blobSize: number;
  duration: number;
  createdAt: number;
  format: string;
  toolUsed: string;
  thumbnailUrl?: string;
}

export interface SlideshowImage {
  id: string;
  url: string;
  title: string;
}

export type DeviceMode = 'phone' | 'tablet' | 'responsive';
export type DeviceOrientation = 'portrait' | 'landscape';

export type CanvasBackgroundType = 'black' | 'blur' | 'gradient-indigo' | 'gradient-sunset' | 'grid' | 'white';

export interface EditorStateSnapshot {
  activeFilter: FilterType;
  filterIntensity: number;
  transform: TransformSettings;
  audioSettings: AudioSettings;
  aspectRatio: AspectRatioType;
  customCrop: CustomCropSettings;
  speed: number;
  trimRange: [number, number];
  watermark: WatermarkSettings;
  fontGenerator: FontGeneratorSettings;
  bgStickerUrl: string | null;
  canvasBackground: CanvasBackgroundType;
  label: string;
  timestamp: number;
}
