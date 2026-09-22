import React from 'react';
import { ExternalLink, Undo2, Redo2, Sparkles } from 'lucide-react';

interface StudioFooterProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoCount?: number;
  redoCount?: number;
  lastAction?: string;
}

export const StudioFooter: React.FC<StudioFooterProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
  lastAction,
}) => {
  const handleOpenVivvyo = (e: React.MouseEvent) => {
    // Open vivvyo.com directly in a new browser tab/window
    try {
      window.open('https://vivvyo.com', '_blank', 'noopener,noreferrer');
    } catch {
      // fallback to default anchor href
    }
  };

  return (
    <footer className="w-full bg-zinc-950/95 border-t border-zinc-900/90 px-3 py-2 shrink-0 select-none z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
        {/* Left: Quick Undo / Redo controls with shortcuts info */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1 shadow-sm">
            <button
              id="btn-footer-undo"
              onClick={onUndo}
              disabled={!canUndo}
              className="px-2 py-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all flex items-center space-x-1"
              title="Undo last change (⌘Z / Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10.5px] font-medium hidden sm:inline">Undo</span>
              {undoCount > 0 && (
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.2 rounded-full text-zinc-300 font-mono font-bold">
                  {undoCount}
                </span>
              )}
            </button>

            <span className="text-zinc-700">|</span>

            <button
              id="btn-footer-redo"
              onClick={onRedo}
              disabled={!canRedo}
              className="px-2 py-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all flex items-center space-x-1"
              title="Redo last change (⌘⇧Z / Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10.5px] font-medium hidden sm:inline">Redo</span>
              {redoCount > 0 && (
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.2 rounded-full text-zinc-300 font-mono font-bold">
                  {redoCount}
                </span>
              )}
            </button>
          </div>

          {lastAction && (
            <span className="text-[10px] text-zinc-500 hidden md:inline truncate max-w-[140px]">
              Last: <span className="text-zinc-400">{lastAction}</span>
            </span>
          )}

          <div className="hidden lg:flex items-center space-x-1.5 text-[10px] text-zinc-500 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Vivvyo Studio Engine v2.5 Pro</span>
          </div>
        </div>

        {/* Right: Copyright text by vivvyo with link to vivvyo.com */}
        <div className="flex items-center space-x-1.5 text-center sm:text-right">
          <span className="text-zinc-500 text-[11px]">
            © {new Date().getFullYear()} <span className="font-semibold text-zinc-400">Vivvyo</span>. All rights reserved.
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="text-zinc-500 text-[11px]">Powered by</span>
          <a
            id="link-vivvyo-site"
            href="https://vivvyo.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenVivvyo}
            className="group inline-flex items-center space-x-1 font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-sm active:scale-95"
            title="Click to open vivvyo.com official website in your browser"
          >
            <span className="tracking-wide">vivvyo</span>
            <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </footer>
  );
};
