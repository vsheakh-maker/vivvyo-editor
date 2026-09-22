import React from 'react';
import { ArrowLeft, Film, Camera, FolderCheck, Plus, Sparkles, Undo2, Redo2 } from 'lucide-react';
import { ToolType } from '../types.ts';

interface HeaderProps {
  activeTool: ToolType | null;
  onBack: () => void;
  onOpenStudio: () => void;
  onOpenCamera: () => void;
  onOpenVideoPicker: () => void;
  onOpenTemplates?: () => void;
  onTriggerExport: () => void;
  savedCount: number;
  currentVideoTitle: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  undoCount?: number;
  redoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTool,
  onBack,
  onOpenStudio,
  onOpenCamera,
  onOpenVideoPicker,
  onOpenTemplates,
  onTriggerExport,
  savedCount,
  currentVideoTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
}) => {
  return (
    <header className="h-14 bg-zinc-900/95 border-b border-zinc-800/80 px-3.5 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
      {/* Left: Back or Brand with Official Vivvyo Logo */}
      <div className="flex items-center space-x-2.5 overflow-hidden">
        {activeTool ? (
          <button
            id="btn-header-back"
            onClick={onBack}
            className="p-1.5 -ml-1 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-400" />
            <span className="hidden sm:inline">Back</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2.5">
            {/* App Logo */}
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-indigo-500/40 shadow-md shadow-indigo-600/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shrink-0 relative flex items-center justify-center">
              <Film className="w-4 h-4 text-white/80 absolute pointer-events-none" />
              <img
                src="/c9724d06-0f9a-4cc7-9de1-4265d250e58f.png"
                alt="Vivvyo Editor Logo"
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">Vivvyo</span>
                <span className="text-xs font-bold text-indigo-400">Editor</span>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[8px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                  STUDIO
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Video name pill when in active tool */}
        {activeTool && (
          <div className="truncate text-xs text-zinc-400 max-w-[130px] sm:max-w-[180px]">
            <span className="font-semibold text-zinc-200 capitalize">{activeTool}</span>
            <span className="mx-1.5 text-zinc-600">•</span>
            <span>{currentVideoTitle}</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Undo / Redo controls */}
        {onUndo && (
          <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60 mr-1">
            <button
              id="btn-header-undo"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo (Ctrl+Z / Cmd+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-header-redo"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo (Ctrl+Y / Cmd+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Templates Quick Button */}
        {onOpenTemplates && (
          <button
            id="btn-header-templates"
            onClick={onOpenTemplates}
            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 text-white flex items-center space-x-1 transition-all shadow-sm"
            title="Trending Templates & TikTok Audio"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span className="hidden sm:inline">Templates</span>
          </button>
        )}

        {/* Switch / Add Video */}
        <button
          id="btn-switch-video"
          onClick={onOpenVideoPicker}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors relative"
          title="Import Video from Device"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Camera Record */}
        <button
          id="btn-open-camera"
          onClick={onOpenCamera}
          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-full transition-colors"
          title="Shoot from Camera"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* My Studio / Exports */}
        <button
          id="btn-open-studio"
          onClick={onOpenStudio}
          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-full transition-colors relative"
          title="My Studio (Saved Exports)"
        >
          <FolderCheck className="w-4 h-4" />
          {savedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>

        {/* Export Quick Button */}
        <button
          id="btn-header-export"
          onClick={onTriggerExport}
          className="ml-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center space-x-1 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Film className="w-3.5 h-3.5 text-indigo-200" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
