import { VideoAsset, AudioTrack, SlideshowImage, FilterPreset, AspectRatioOption } from '../types.ts';

export const SAMPLE_VIDEOS: VideoAsset[] = [
  {
    id: 'sample-ocean',
    title: 'Deep Ocean Waves',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    duration: 46,
    width: 1280,
    height: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sample-animation',
    title: 'Neon Urban Beat',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    duration: 15,
    width: 1280,
    height: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sample-sintel',
    title: 'Cinematic Fantasy Trailer',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    duration: 52,
    width: 1280,
    height: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sample-flower',
    title: 'Blossom Macro Bloom',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    duration: 10,
    width: 1280,
    height: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80',
  },
];

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'lofi-chill',
    title: 'Lofi Chill Sunset',
    genre: 'Lofi / Hip Hop',
    duration: 60,
    bpm: 82,
    type: 'synth',
  },
  {
    id: 'upbeat-dance',
    title: 'Electro Summer Vibes',
    genre: 'Electronic / Dance',
    duration: 60,
    bpm: 124,
    type: 'synth',
  },
  {
    id: 'cinematic-pulse',
    title: 'Deep Horizon Atmos',
    genre: 'Cinematic / Drone',
    duration: 60,
    bpm: 90,
    type: 'synth',
  },
  {
    id: 'acoustic-breeze',
    title: 'Sunny Day Acoustic',
    genre: 'Acoustic / Warm',
    duration: 60,
    bpm: 105,
    type: 'synth',
  },
];

export const SAMPLE_SLIDESHOW_IMAGES: SlideshowImage[] = [
  {
    id: 'img-1',
    title: 'Mountain Sunrise',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'img-2',
    title: 'Golden Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'img-3',
    title: 'Neon Cyber City',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'img-4',
    title: 'Autumn Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'img-5',
    title: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
];

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Original',
    cssFilter: 'none',
    badgeColor: 'bg-zinc-600',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    cssFilter: 'contrast(1.2) saturate(1.3) brightness(0.95)',
    badgeColor: 'bg-amber-600',
  },
  {
    id: 'warm',
    name: 'Golden Hour',
    cssFilter: 'sepia(0.35) saturate(1.4) hue-rotate(-10deg) brightness(1.05)',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 'cool',
    name: 'Teal & Cool',
    cssFilter: 'hue-rotate(185deg) saturate(1.2) contrast(1.1)',
    badgeColor: 'bg-cyan-600',
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    cssFilter: 'saturate(1.8) contrast(1.15) brightness(1.02)',
    badgeColor: 'bg-rose-500',
  },
  {
    id: 'sepia',
    name: 'Vintage 90s',
    cssFilter: 'sepia(0.75) contrast(1.1) brightness(0.9)',
    badgeColor: 'bg-amber-700',
  },
  {
    id: 'noir',
    name: 'Monochrome',
    cssFilter: 'grayscale(1) contrast(1.35) brightness(0.95)',
    badgeColor: 'bg-zinc-700',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    cssFilter: 'contrast(1.3) saturate(2) hue-rotate(280deg)',
    badgeColor: 'bg-purple-600',
  },
  {
    id: 'invert',
    name: 'X-Ray Invert',
    cssFilter: 'invert(1) contrast(1.2)',
    badgeColor: 'bg-emerald-600',
  },
  {
    id: 'vintage',
    name: 'Faded Film',
    cssFilter: 'sepia(0.2) contrast(0.9) brightness(1.1) saturate(0.8)',
    badgeColor: 'bg-stone-500',
  },
  {
    id: 'golden',
    name: 'Golden Glow',
    cssFilter: 'saturate(1.5) brightness(1.08) contrast(1.1) sepia(0.25)',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    cssFilter: 'hue-rotate(300deg) saturate(2) contrast(1.25)',
    badgeColor: 'bg-fuchsia-500',
  },
  {
    id: 'pastel',
    name: 'Soft Pastel',
    cssFilter: 'contrast(0.9) brightness(1.15) saturate(1.2)',
    badgeColor: 'bg-teal-400',
  },
  {
    id: 'vhs-glitch',
    name: 'VHS Glitch',
    cssFilter: 'contrast(1.4) saturate(1.6) hue-rotate(90deg)',
    badgeColor: 'bg-red-500',
  },
];

export const FILTERS = FILTER_PRESETS;

export const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: 'original',
    label: 'Original',
    sub: 'As recorded',
    ratio: null,
    iconName: 'Maximize',
  },
  {
    id: '9:16',
    label: '9:16',
    sub: 'TikTok / Reels',
    ratio: 9 / 16,
    iconName: 'Smartphone',
  },
  {
    id: '1:1',
    label: '1:1',
    sub: 'Square Post',
    ratio: 1,
    iconName: 'Square',
  },
  {
    id: '16:9',
    label: '16:9',
    sub: 'YouTube / TV',
    ratio: 16 / 9,
    iconName: 'Tv',
  },
  {
    id: '4:5',
    label: '4:5',
    sub: 'Insta Portrait',
    ratio: 4 / 5,
    iconName: 'RectangleVertical',
  },
  {
    id: '4:3',
    label: '4:3',
    sub: 'Classic Tablet',
    ratio: 4 / 3,
    iconName: 'Tablet',
  },
  {
    id: 'custom',
    label: 'Custom',
    sub: 'Freeform Ratio',
    ratio: null,
    iconName: 'Crop',
  },
];

export interface FontStylePreset {
  id: string;
  name: string;
  category: 'trendy' | 'retro' | 'cinematic' | 'calligraphy' | 'bold';
  fontFamily: string;
  previewClass: string;
  defaultColor: string;
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
  defaultGlowColor: string;
  defaultEffect: 'none' | 'glow' | 'stroke' | 'shadow' | 'gradient' | '3d' | 'vhs' | 'comic' | 'bubble';
  defaultBgPill: boolean;
  defaultPillColor: string;
}

export const FONT_STYLE_PRESETS: FontStylePreset[] = [
  {
    id: 'tiktok-bold',
    name: 'TikTok Viral Bold',
    category: 'trendy',
    fontFamily: "'Montserrat', sans-serif",
    previewClass: 'font-black uppercase tracking-tight',
    defaultColor: '#ffffff',
    defaultStrokeColor: '#000000',
    defaultStrokeWidth: 3,
    defaultGlowColor: '#000000',
    defaultEffect: 'stroke',
    defaultBgPill: false,
    defaultPillColor: '#000000cc',
  },
  {
    id: 'neon-glow',
    name: 'Cyber Neon Pulse',
    category: 'trendy',
    fontFamily: "'Orbitron', sans-serif",
    previewClass: 'font-bold uppercase tracking-widest',
    defaultColor: '#38bdf8',
    defaultStrokeColor: '#0284c7',
    defaultStrokeWidth: 1,
    defaultGlowColor: '#00f0ff',
    defaultEffect: 'glow',
    defaultBgPill: false,
    defaultPillColor: '#000000bb',
  },
  {
    id: 'retro-vhs',
    name: '90s VHS Camcorder',
    category: 'retro',
    fontFamily: "'Press Start 2P', monospace",
    previewClass: 'font-mono text-xs tracking-wider',
    defaultColor: '#facc15',
    defaultStrokeColor: '#000000',
    defaultStrokeWidth: 2,
    defaultGlowColor: '#eab308',
    defaultEffect: 'vhs',
    defaultBgPill: true,
    defaultPillColor: '#000000dd',
  },
  {
    id: 'aesthetic-script',
    name: 'Aesthetic Calligraphy',
    category: 'calligraphy',
    fontFamily: "'Pacifico', cursive",
    previewClass: 'font-normal lowercase',
    defaultColor: '#fda4af',
    defaultStrokeColor: '#be123c',
    defaultStrokeWidth: 1,
    defaultGlowColor: '#fb7185',
    defaultEffect: 'shadow',
    defaultBgPill: false,
    defaultPillColor: '#00000088',
  },
  {
    id: 'cinematic-epic',
    name: 'Cinematic Blockbuster',
    category: 'cinematic',
    fontFamily: "'Cinzel', serif",
    previewClass: 'font-bold uppercase tracking-widest',
    defaultColor: '#fde047',
    defaultStrokeColor: '#713f12',
    defaultStrokeWidth: 1,
    defaultGlowColor: '#eab308',
    defaultEffect: '3d',
    defaultBgPill: false,
    defaultPillColor: '#00000099',
  },
  {
    id: 'comic-pop',
    name: 'Comic Book Bangers',
    category: 'bold',
    fontFamily: "'Bangers', cursive",
    previewClass: 'font-normal tracking-wide',
    defaultColor: '#facc15',
    defaultStrokeColor: '#000000',
    defaultStrokeWidth: 3,
    defaultGlowColor: '#e11d48',
    defaultEffect: 'comic',
    defaultBgPill: false,
    defaultPillColor: '#000000aa',
  },
  {
    id: 'street-marker',
    name: 'Urban Street Marker',
    category: 'bold',
    fontFamily: "'Permanent Marker', cursive",
    previewClass: 'font-normal tracking-normal',
    defaultColor: '#ffffff',
    defaultStrokeColor: '#dc2626',
    defaultStrokeWidth: 2,
    defaultGlowColor: '#dc2626',
    defaultEffect: 'stroke',
    defaultBgPill: false,
    defaultPillColor: '#00000088',
  },
  {
    id: 'editorial-serif',
    name: 'Vogue Luxury Editorial',
    category: 'cinematic',
    fontFamily: "'Playfair Display', serif",
    previewClass: 'italic font-bold',
    defaultColor: '#ffffff',
    defaultStrokeColor: '#18181b',
    defaultStrokeWidth: 1,
    defaultGlowColor: '#a1a1aa',
    defaultEffect: 'shadow',
    defaultBgPill: false,
    defaultPillColor: '#00000099',
  },
  {
    id: 'hacker-matrix',
    name: 'Tech Monospace',
    category: 'trendy',
    fontFamily: "'Space Grotesk', sans-serif",
    previewClass: 'font-mono font-bold tracking-tight',
    defaultColor: '#4ade80',
    defaultStrokeColor: '#14532d',
    defaultStrokeWidth: 1,
    defaultGlowColor: '#22c55e',
    defaultEffect: 'glow',
    defaultBgPill: true,
    defaultPillColor: '#052e16ee',
  },
  {
    id: 'subtitles-pill',
    name: 'Clean Subtitle Pill',
    category: 'trendy',
    fontFamily: "'Montserrat', sans-serif",
    previewClass: 'font-bold tracking-normal',
    defaultColor: '#ffffff',
    defaultStrokeColor: '#000000',
    defaultStrokeWidth: 0,
    defaultGlowColor: '#000000',
    defaultEffect: 'none',
    defaultBgPill: true,
    defaultPillColor: '#000000cc',
  },
];
