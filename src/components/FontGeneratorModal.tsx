import React, { useState } from 'react';
import {
  X,
  Type,
  Sparkles,
  Check,
  Palette,
  Sliders,
  AlignVerticalJustifyCenter,
  MoveVertical,
  Layers,
} from 'lucide-react';
import { FontGeneratorSettings } from '../types.ts';
import { FONT_STYLE_PRESETS, FontStylePreset } from '../data/sampleMedia.ts';

interface FontGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FontGeneratorSettings;
  onApply: (settings: FontGeneratorSettings) => void;
}

export const FontGeneratorModal: React.FC<FontGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApply,
}) => {
  const [text, setText] = useState<string>(currentSettings.text || 'VIRAL VIBES 🔥');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tiktok-bold');
  const [fontFamily, setFontFamily] = useState<string>(currentSettings.fontFamily || "'Montserrat', sans-serif");
  const [fontSize, setFontSize] = useState<number>(currentSettings.fontSize || 32);
  const [color, setColor] = useState<string>(currentSettings.color || '#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>(currentSettings.strokeColor || '#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(currentSettings.strokeWidth || 3);
  const [effect, setEffect] = useState<FontGeneratorSettings['effect']>(currentSettings.effect || 'stroke');
  const [glowColor, setGlowColor] = useState<string>(currentSettings.glowColor || '#00f0ff');
  const [glowIntensity, setGlowIntensity] = useState<number>(currentSettings.glowIntensity || 15);
  const [bgPill, setBgPill] = useState<boolean>(currentSettings.bgPill || false);
  const [pillColor, setPillColor] = useState<string>(currentSettings.pillColor || '#000000cc');
  const [positionY, setPositionY] = useState<number>(currentSettings.positionY || 75);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: FontStylePreset) => {
    setSelectedPresetId(preset.id);
    setFontFamily(preset.fontFamily);
    setColor(preset.defaultColor);
    setStrokeColor(preset.defaultStrokeColor);
    setStrokeWidth(preset.defaultStrokeWidth);
    setEffect(preset.defaultEffect);
    setGlowColor(preset.defaultGlowColor);
    setBgPill(preset.defaultBgPill);
    setPillColor(preset.defaultPillColor);
  };

  const handleSave = () => {
    onApply({
      ...currentSettings,
      text,
      fontFamily,
      fontStyleId: selectedPresetId,
      fontSize,
      color,
      strokeColor,
      strokeWidth,
      effect,
      glowColor,
      glowIntensity,
      bgPill,
      pillColor,
      positionY,
    });
    onClose();
  };

  // Generate CSS style for live preview text
  const getPreviewStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      fontFamily,
      fontSize: `${fontSize}px`,
      color,
      lineHeight: 1.2,
      WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
    };

    if (effect === 'glow') {
      style.textShadow = `0 0 ${glowIntensity}px ${glowColor}, 0 0 ${glowIntensity * 1.5}px ${glowColor}`;
    } else if (effect === 'shadow') {
      style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
    } else if (effect === '3d') {
      style.textShadow = '2px 2px 0 #000, 4px 4px 0 #333, 6px 6px 10px rgba(0,0,0,0.7)';
    } else if (effect === 'comic') {
      style.textShadow = '4px 4px 0 #dc2626, 6px 6px 0 #000';
    } else if (effect === 'vhs') {
      style.textShadow = '2px 0 0 #00ffff, -2px 0 0 #ff00ff';
    }

    return style;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Font & Text Generator
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                  Viral Styles
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">Viral fonts, neon glows, 3D shadows & subtitles</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-950 to-black border border-zinc-800 flex items-center justify-center p-4">
          <div
            className="w-full text-center transition-all"
            style={{ transform: `translateY(${(positionY - 50) * 0.8}px)` }}
          >
            <div
              className={`inline-block max-w-[90%] transition-all ${
                bgPill ? 'px-4 py-2 rounded-2xl backdrop-blur-md' : ''
              }`}
              style={{
                backgroundColor: bgPill ? pillColor : 'transparent',
              }}
            >
              <span style={getPreviewStyle()}>{text || 'Enter text below...'}</span>
            </div>
          </div>

          {/* Position indicator */}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-mono text-zinc-400">
            Y: {positionY}% ({positionY < 35 ? 'Header' : positionY > 65 ? 'Subtitle' : 'Center'})
          </span>
        </div>

        {/* Text Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-300">Custom Text / Caption:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your caption..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Style Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-300">Popular Font Styles:</span>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {FONT_STYLE_PRESETS.map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-mono">{p.name}</div>
                  <div
                    className="text-xs truncate mt-1"
                    style={{
                      fontFamily: p.fontFamily,
                      color: p.defaultColor,
                    }}
                  >
                    Vivvyo Vibes
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Controls */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-3 text-xs">
          {/* Font Family Selector */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Font Typeface:</span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="'Montserrat', sans-serif">Montserrat (Modern TikTok)</option>
              <option value="'Orbitron', sans-serif">Orbitron (Cyberpunk Sci-Fi)</option>
              <option value="'Pacifico', cursive">Pacifico (Aesthetic Calligraphy)</option>
              <option value="'Cinzel', serif">Cinzel (Cinematic Epic)</option>
              <option value="'Bangers', cursive">Bangers (Comic Pop)</option>
              <option value="'Permanent Marker', cursive">Permanent Marker (Street Graffiti)</option>
              <option value="'Playfair Display', serif">Playfair Display (Vogue Editorial)</option>
              <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech Monospace)</option>
              <option value="'Press Start 2P', monospace">Press Start 2P (Retro 8-Bit VHS)</option>
            </select>
          </div>

          {/* Sliders: Size & Y-Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Font Size</span>
                <span className="font-mono text-amber-400">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Vertical Position</span>
                <span className="font-mono text-amber-400">{positionY}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="88"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Color & Stroke */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400">Text Fill Color:</span>
              <div className="flex items-center space-x-1">
                {['#ffffff', '#facc15', '#38bdf8', '#fb7185', '#4ade80', '#000000'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      color === c ? 'scale-110 border-white ring-1 ring-amber-400' : 'border-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400">Outline Stroke:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">{strokeWidth}px</span>
              </div>
            </div>
          </div>

          {/* Subtitle Background Pill Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
            <span className="text-zinc-300 text-[11px]">Background Subtitle Pill</span>
            <button
              onClick={() => setBgPill(!bgPill)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                bgPill ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  bgPill ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Text Overlay to Video</span>
          </button>

          {currentSettings.text && (
            <button
              onClick={() => {
                onApply({
                  ...currentSettings,
                  text: '',
                });
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
            >
              Remove Text Overlay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
