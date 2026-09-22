import React, { useState } from 'react';
import { Images, Plus, Trash2, Sparkles, Music, Clock } from 'lucide-react';
import { SlideshowImage } from '../../types.ts';
import { SAMPLE_SLIDESHOW_IMAGES, AUDIO_TRACKS } from '../../data/sampleMedia.ts';
import { createSlideshowVideo } from '../../utils/videoProcessor.ts';

interface SlideshowToolProps {
  onSlideshowCreated: (blob: Blob, url: string, duration: number) => void;
}

export const SlideshowTool: React.FC<SlideshowToolProps> = ({ onSlideshowCreated }) => {
  const [images, setImages] = useState<SlideshowImage[]>(SAMPLE_SLIDESHOW_IMAGES);
  const [durationPerSlide, setDurationPerSlide] = useState(2.5);
  const [selectedBgm, setSelectedBgm] = useState('lofi-chill');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemoveImage = (id: string) => {
    if (images.length <= 2) return;
    setImages(images.filter((img) => img.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: SlideshowImage[] = Array.from(e.target.files).map((f, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        title: f.name.replace(/\.[^/.]+$/, ''),
        url: URL.createObjectURL(f),
      }));
      setImages([...images, ...newItems]);
    }
  };

  const handleCreateSlideshow = async () => {
    try {
      setIsGenerating(true);
      setProgress(5);
      const res = await createSlideshowVideo(
        images,
        durationPerSlide,
        selectedBgm,
        (pct) => setProgress(pct)
      );
      onSlideshowCreated(res.blob, res.blobUrl, res.duration);
    } catch (err) {
      console.error('Slideshow creation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalDuration = (images.length * durationPerSlide).toFixed(1);

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Images className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Photo Slideshow Maker</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-pink-400 bg-pink-950 px-2 py-0.5 rounded border border-pink-800/80">
          <span>{images.length} Photos</span>
          <span>•</span>
          <span>{totalDuration}s</span>
        </div>
      </div>

      {/* Selected Photos Reel */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[11px] text-zinc-400">
          <span>Photos in Sequence:</span>
          <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 group"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 bg-black/70 text-[9px] font-mono font-bold text-white px-1 rounded">
                #{idx + 1}
              </div>
              {images.length > 2 && (
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute bottom-1 right-1 p-1 bg-rose-600/90 text-white rounded opacity-80 hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Slide Duration */}
        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>Slide Duration:</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1.5, 2.5, 3.5].map((sec) => (
              <button
                key={sec}
                onClick={() => setDurationPerSlide(sec)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  durationPerSlide === sec
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Music Selector */}
        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
            <Music className="w-3.5 h-3.5 text-violet-400" />
            <span>Soundtrack:</span>
          </div>
          <select
            value={selectedBgm}
            onChange={(e) => setSelectedBgm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white text-[11px] rounded px-1.5 py-1 focus:outline-none"
          >
            {AUDIO_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action */}
      <div className="pt-1">
        <button
          id="btn-create-slideshow"
          onClick={handleCreateSlideshow}
          disabled={isGenerating}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-200" />
          <span>
            {isGenerating ? `Rendering Video (${progress}%)...` : 'Create & Export Slideshow Video'}
          </span>
        </button>
      </div>
    </div>
  );
};
