import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Music2,
  Play,
  Pause,
  Check,
  Smartphone,
  Tv,
  Layers,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { TIKTOK_TRENDING_SONGS, VIDEO_TEMPLATES } from '../data/trendingMedia.ts';
import { VideoTemplate, TikTokSong } from '../types.ts';
import { playSynthTrack, SynthPlaybackHandle } from '../utils/audioSynth.ts';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: VideoTemplate, song?: TikTokSong) => void;
  onSelectSong: (song: TikTokSong) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  onSelectSong,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'songs'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [songCategory, setSongCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [synthHandle, setSynthHandle] = useState<SynthPlaybackHandle | null>(null);

  if (!isOpen) return null;

  const handleTogglePlaySong = (song: TikTokSong) => {
    if (playingSongId === song.id) {
      if (synthHandle) synthHandle.stop();
      setPlayingSongId(null);
      setSynthHandle(null);
    } else {
      if (synthHandle) synthHandle.stop();
      const handle = playSynthTrack(song.id, 0.6);
      setSynthHandle(handle);
      setPlayingSongId(song.id);
    }
  };

  const handleClose = () => {
    if (synthHandle) synthHandle.stop();
    setPlayingSongId(null);
    setSynthHandle(null);
    onClose();
  };

  const filteredTemplates = VIDEO_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'trending'
        ? tpl.isTrending
        : tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredSongs = TIKTOK_TRENDING_SONGS.filter((song) => {
    const matchesCat =
      songCategory === 'all' ? true : song.category === songCategory;
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Vivvyo Templates & TikTok Audio
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-pink-500/20 text-pink-400 rounded-full border border-pink-500/30">
                  50+ Songs
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">Trending styles, beat syncs & viral audio</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-zinc-950 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Video Templates ({VIDEO_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'songs'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'bg-zinc-950 text-zinc-400 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>TikTok Songs ({TIKTOK_TRENDING_SONGS.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative my-2">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'templates'
                ? 'Search templates (e.g. Velocity, Lofi, Gym...)'
                : 'Search 50+ TikTok songs (e.g. Espresso, FE!N, Phonk...)'
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none text-[10px]">
          {activeTab === 'templates' ? (
            <>
              {[
                { id: 'all', label: 'All Templates' },
                { id: 'trending', label: '🔥 Trending' },
                { id: 'viral', label: '⚡ Velocity & Viral' },
                { id: 'aesthetic', label: '✨ Aesthetic' },
                { id: 'travel', label: '✈️ Travel & Cinema' },
                { id: 'fitness', label: '💪 Gym Tok' },
                { id: 'retro', label: '📼 90s Retro' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    selectedCategory === c.id
                      ? 'bg-white text-black font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'all', label: 'All 50+ Songs' },
                { id: 'viral', label: '🔥 Viral Pop' },
                { id: 'phonk', label: '⚡ Phonk' },
                { id: 'lofi', label: '☕ Chill Lo-Fi' },
                { id: 'speedup', label: '⏩ Sped-Up' },
                { id: 'cinematic', label: '🎬 Cinematic' },
                { id: 'dance', label: '🕺 Dance & Hip-Hop' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSongCategory(c.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    songCategory === c.id
                      ? 'bg-pink-500 text-white font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 mt-1">
          {activeTab === 'templates' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredTemplates.map((template) => {
                const matchedSong = TIKTOK_TRENDING_SONGS.find((s) => s.id === template.songId);
                return (
                  <div
                    key={template.id}
                    className="group bg-zinc-950 border border-zinc-800 hover:border-indigo-500/70 rounded-2xl overflow-hidden flex flex-col transition-all text-left shadow-sm"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[9/10] overflow-hidden bg-zinc-900">
                      <img
                        src={template.previewImageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Badge */}
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white border border-white/10">
                        {template.badge}
                      </span>

                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-indigo-600/80 backdrop-blur-md text-[9px] font-mono font-bold text-white">
                        {template.aspectRatio}
                      </span>

                      {/* Sample overlay text preview */}
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 line-clamp-1">
                          {template.sampleText}
                        </span>
                      </div>
                    </div>

                    {/* Meta & Apply */}
                    <div className="p-2.5 flex flex-col flex-1 justify-between space-y-2">
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {template.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {template.subtitle}
                        </p>
                        {matchedSong && (
                          <div className="flex items-center space-x-1 mt-1 text-[9px] text-pink-400 font-medium">
                            <Music2 className="w-2.5 h-2.5" />
                            <span className="truncate">{matchedSong.title}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          handleClose();
                          onApplyTemplate(template, matchedSong);
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center justify-center space-x-1 transition-all"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Use Template</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredSongs.map((song, idx) => {
                const isPlaying = playingSongId === song.id;
                return (
                  <div
                    key={song.id}
                    className={`p-2 rounded-2xl border transition-all flex items-center justify-between ${
                      isPlaying
                        ? 'bg-pink-950/40 border-pink-500/80 shadow-md shadow-pink-900/20'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      {/* Play preview button */}
                      <button
                        onClick={() => handleTogglePlaySong(song)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isPlaying
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40 animate-pulse'
                            : 'bg-zinc-850 hover:bg-zinc-750 text-white'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      {/* Song info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                          <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="truncate">{song.artist}</span>
                          <span>•</span>
                          <span className="text-pink-400 font-mono font-semibold">{song.views} views</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-500">{song.bpm} BPM</span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Video Button */}
                    <button
                      onClick={() => {
                        handleClose();
                        onSelectSong(song);
                      }}
                      className="ml-2 py-1 px-2.5 rounded-xl bg-zinc-800 hover:bg-pink-600 text-zinc-200 hover:text-white text-[10px] font-bold shrink-0 transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Use</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
