import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Download,
  Check,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Palette,
  Eye,
  Layers,
} from 'lucide-react';
import { BgRemoverSettings } from '../types.ts';
import { removeImageBackground } from '../utils/videoProcessor.ts';

interface BgRemoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAsSticker?: (dataUrl: string) => void;
}

const SAMPLE_SUBJECT_IMAGES = [
  {
    id: 's-person',
    title: 'Model Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 's-skate',
    title: 'Skater Action',
    url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 's-sneaker',
    title: 'Sneaker Product',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 's-dog',
    title: 'Cute Puppy',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  },
];

export const BgRemoverModal: React.FC<BgRemoverModalProps> = ({
  isOpen,
  onClose,
  onApplyAsSticker,
}) => {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(SAMPLE_SUBJECT_IMAGES[0].url);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [settings, setSettings] = useState<BgRemoverSettings>({
    tolerance: 45,
    edgeSmooth: 2,
    backgroundType: 'transparent',
    bgColor: '#ffffff',
    bgGradient: 'sunset',
  });

  if (!isOpen) return null;

  const handleProcess = async (srcToUse = currentImageSrc, customSettings = settings) => {
    setIsProcessing(true);
    try {
      const res = await removeImageBackground(srcToUse, customSettings);
      setResultDataUrl(res.dataUrl);
    } catch (err) {
      console.error('BG removal error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentImageSrc(url);
    handleProcess(url, settings);
  };

  const handleDownloadPng = () => {
    if (!resultDataUrl) return;
    const a = document.createElement('a');
    a.href = resultDataUrl;
    a.download = `Vivvyo_NoBg_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Auto Image BG Remover
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  AI Edge
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">One-tap cutout, transparent PNG & custom backdrops</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Canvas / Image Preview */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
          {/* Transparent checkerboard background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />

          {/* Active Image */}
          <img
            src={showOriginal || !resultDataUrl ? currentImageSrc : resultDataUrl}
            alt="Subject"
            className="relative z-10 max-h-full max-w-full object-contain p-2"
          />

          {isProcessing && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-xs font-bold text-white">Removing Background...</span>
            </div>
          )}

          {/* Before/After Toggle Pill */}
          {resultDataUrl && (
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-200 border border-white/20 flex items-center space-x-1"
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>{showOriginal ? 'Showing Original' : 'Hold for Original'}</span>
            </button>
          )}
        </div>

        {/* Upload Button & Sample Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300">Select or Upload Photo:</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold flex items-center space-x-1 transition-colors"
            >
              <Upload className="w-3 h-3 text-emerald-400" />
              <span>Import Device Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {SAMPLE_SUBJECT_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setCurrentImageSrc(sample.url);
                  handleProcess(sample.url, settings);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                  currentImageSrc === sample.url
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'border-zinc-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={sample.url} alt={sample.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Background Type Selection */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-300">Replacement Backdrop:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'transparent', label: 'Transparent', icon: '✨' },
              { id: 'color', label: 'Solid Color', icon: '🎨' },
              { id: 'gradient', label: 'Gradient', icon: '🌈' },
              { id: 'blur', label: 'Bokeh Blur', icon: '💫' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  const updated = { ...settings, backgroundType: type.id as any };
                  setSettings(updated);
                  handleProcess(currentImageSrc, updated);
                }}
                className={`p-2 rounded-xl text-center border transition-all ${
                  settings.backgroundType === type.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-sm">{type.icon}</div>
                <div className="text-[9px] mt-0.5">{type.label}</div>
              </button>
            ))}
          </div>

          {/* Color & Gradient Choices */}
          {settings.backgroundType === 'color' && (
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-zinc-400">Color:</span>
              <div className="flex items-center space-x-1.5">
                {['#ffffff', '#000000', '#22c55e', '#3b82f6', '#f43f5e', '#eab308'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      const updated = { ...settings, bgColor: c };
                      setSettings(updated);
                      handleProcess(currentImageSrc, updated);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      settings.bgColor === c ? 'scale-110 border-white' : 'border-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {settings.backgroundType === 'gradient' && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { id: 'sunset', label: 'Sunset', bg: 'from-orange-500 to-pink-500' },
                { id: 'cyber', label: 'Cyber', bg: 'from-purple-500 to-cyan-500' },
                { id: 'emerald', label: 'Emerald', bg: 'from-emerald-500 to-blue-500' },
                { id: 'violet', label: 'Violet', bg: 'from-indigo-500 to-purple-600' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    const updated = { ...settings, bgGradient: g.id as any };
                    setSettings(updated);
                    handleProcess(currentImageSrc, updated);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r ${g.bg} border transition-all ${
                    settings.bgGradient === g.id ? 'border-white scale-105' : 'border-transparent opacity-80'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sliders: Tolerance & Edge Smoothing */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">Cutout Sensitivity (Tolerance)</span>
              <span className="font-mono text-emerald-400 font-bold">{settings.tolerance}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={settings.tolerance}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSettings((s) => ({ ...s, tolerance: val }));
              }}
              onMouseUp={() => handleProcess(currentImageSrc, settings)}
              onTouchEnd={() => handleProcess(currentImageSrc, settings)}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">Edge Smoothing (Feathering)</span>
              <span className="font-mono text-emerald-400 font-bold">{settings.edgeSmooth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={settings.edgeSmooth}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSettings((s) => ({ ...s, edgeSmooth: val }));
              }}
              onMouseUp={() => handleProcess(currentImageSrc, settings)}
              onTouchEnd={() => handleProcess(currentImageSrc, settings)}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => handleProcess(currentImageSrc, settings)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate Cutout</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPng}
              disabled={!resultDataUrl}
              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PNG</span>
            </button>

            {onApplyAsSticker && (
              <button
                onClick={() => {
                  if (resultDataUrl) {
                    onApplyAsSticker(resultDataUrl);
                    onClose();
                  }
                }}
                disabled={!resultDataUrl}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Apply to Video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
