import React, { useState, useEffect } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  RotateCcw,
  Flame,
  Search,
} from 'lucide-react';
import { AudioSettings } from '../../types.ts';
import { AUDIO_TRACKS } from '../../data/sampleMedia.ts';
import { TIKTOK_TRENDING_SONGS } from '../../data/trendingMedia.ts';
import { playSynthTrack, SynthPlaybackHandle } from '../../utils/audioSynth.ts';

interface AudioMixerToolProps {
  audioSettings: AudioSettings;
  onChangeAudio: (settings: AudioSettings) => void;
  onApplyAudio: () => void;
  onReset: () => void;
}

export const AudioMixerTool: React.FC<AudioMixerToolProps> = ({
  audioSettings,
  onChangeAudio,
  onApplyAudio,
  onReset,
}) => {
  const [playingBgmId, setPlayingBgmId] = useState<string | null>(null);
  const [synthHandle, setSynthHandle] = useState<SynthPlaybackHandle | null>(null);
  const [activeTab, setActiveTab] = useState<'tiktok' | 'ambient'>('tiktok');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Clean up any playing audio when unmounting
  useEffect(() => {
    return () => {
      if (synthHandle) {
        synthHandle.stop();
      }
    };
  }, [synthHandle]);

  const handleToggleBgmAudition = (trackId: string) => {
    if (playingBgmId === trackId) {
      if (synthHandle) synthHandle.stop();
      setSynthHandle(null);
      setPlayingBgmId(null);
    } else {
      if (synthHandle) synthHandle.stop();
      const handle = playSynthTrack(trackId, audioSettings.bgmVolume);
      setSynthHandle(handle);
      setPlayingBgmId(trackId);
    }
  };

  const handleSelectBgm = (trackId: string | null) => {
    onChangeAudio({
      ...audioSettings,
      bgmTrackId: trackId,
    });
  };

  const categories = ['All', 'Phonk', 'Dance', 'Lofi', 'HipHop', 'Latin', 'Electronic', 'Rock'];

  const filteredTikTokSongs = TIKTOK_TRENDING_SONGS.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5 max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Audio & BGM Mixer</span>
        </div>
        <button
          onClick={() => onChangeAudio({ ...audioSettings, muted: !audioSettings.muted })}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            audioSettings.muted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {audioSettings.muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{audioSettings.muted ? 'Muted' : 'Unmuted'}</span>
        </button>
      </div>

      {/* Video Volume Slider */}
      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>Original Video Track:</span>
          <span className="font-mono text-zinc-200">
            {audioSettings.muted ? '0%' : `${Math.round(audioSettings.videoVolume * 100)}%`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          disabled={audioSettings.muted}
          value={audioSettings.muted ? 0 : audioSettings.videoVolume}
          onChange={(e) => onChangeAudio({ ...audioSettings, videoVolume: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-violet-500 disabled:opacity-30"
        />
      </div>

      {/* Track Category Selectors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('tiktok')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'tiktok'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>50+ TikTok Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('ambient')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ambient'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ambient
            </button>
          </div>

          <button
            onClick={() => handleSelectBgm(null)}
            className={`text-[10px] px-2 py-1 rounded border transition-all ${
              audioSettings.bgmTrackId === null
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            No Music
          </button>
        </div>

        {/* TikTok Category Pills */}
        {activeTab === 'tiktok' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-pink-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {activeTab === 'tiktok'
            ? filteredTikTokSongs.slice(0, 30).map((track, idx) => {
                const isSelected = audioSettings.bgmTrackId === track.id;
                const isAuditioning = playingBgmId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-950/70 border-pink-500 text-white font-medium ring-1 ring-pink-500/30'
                        : 'bg-zinc-950 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectBgm(track.id)}
                      className="flex-1 truncate mr-1.5 text-left"
                    >
                      <div className="truncate font-semibold text-zinc-100 flex items-center gap-1">
                        <span className="text-[10px] text-pink-400">#{idx + 1}</span>
                        <span>{track.title}</span>
                      </div>
                      <div className="text-[9px] text-zinc-400 truncate">
                        {track.artist} • {track.views} views
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBgmAudition(track.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors shrink-0 ${
                        isAuditioning
                          ? 'bg-pink-600 text-white'
                          : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Audition Song"
                    >
                      {isAuditioning ? (
                        <Square className="w-3 h-3 fill-white" />
                      ) : (
                        <Play className="w-3 h-3 fill-current text-pink-400" />
                      )}
                    </button>
                  </div>
                );
              })
            : AUDIO_TRACKS.map((track) => {
                const isSelected = audioSettings.bgmTrackId === track.id;
                const isAuditioning = playingBgmId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-violet-950/70 border-violet-500 text-white font-medium ring-1 ring-violet-500/30'
                        : 'bg-zinc-950 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectBgm(track.id)}
                      className="flex-1 truncate mr-1.5 text-left"
                    >
                      <div className="truncate font-semibold text-zinc-200">{track.title}</div>
                      <div className="text-[9px] text-zinc-500">{track.genre}</div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBgmAudition(track.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors shrink-0 ${
                        isAuditioning
                          ? 'bg-violet-600 text-white'
                          : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Audition Soundtrack"
                    >
                      {isAuditioning ? (
                        <Square className="w-3 h-3 fill-white" />
                      ) : (
                        <Play className="w-3 h-3 fill-current text-violet-400" />
                      )}
                    </button>
                  </div>
                );
              })}
        </div>

        {/* BGM Volume Slider */}
        {audioSettings.bgmTrackId && (
          <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800/80 flex items-center space-x-2 mt-1">
            <span className="text-[10px] text-zinc-400">BGM Volume:</span>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={audioSettings.bgmVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                onChangeAudio({ ...audioSettings, bgmVolume: vol });
                if (synthHandle) synthHandle.setVolume(vol);
              }}
              className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-[10px] font-mono text-violet-400 font-bold">
              {Math.round(audioSettings.bgmVolume * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Reset Audio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-audio"
          onClick={onApplyAudio}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-violet-600/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-200" />
          <span>Apply Audio & Export</span>
        </button>
      </div>
    </div>
  );
};
