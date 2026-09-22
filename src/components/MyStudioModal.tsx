import React, { useState } from 'react';
import { X, FolderCheck, Film, Music, Download, Trash2, Play, ExternalLink } from 'lucide-react';
import { ExportedItem } from '../types.ts';

interface MyStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExportedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const MyStudioModal: React.FC<MyStudioModalProps> = ({
  isOpen,
  onClose,
  items,
  onDeleteItem,
  onClearAll,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'video' | 'audio'>('all');
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filterTab === 'video') return item.type === 'video';
    if (filterTab === 'audio') return item.type === 'audio';
    return true;
  });

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = (item: ExportedItem) => {
    const a = document.createElement('a');
    a.href = item.blobUrl;
    a.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${item.format}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-md h-[85vh] sm:h-[650px] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FolderCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">My Studio Gallery</h3>
              <p className="text-[11px] text-zinc-400">{items.length} Saved Exported Files</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-zinc-400 hover:text-rose-400 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-zinc-800 flex items-center space-x-2 bg-zinc-950/60 shrink-0">
          {(['all', 'video', 'audio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab} ({items.filter((i) => (tab === 'all' ? true : i.type === tab)).length})
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Film className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-xs font-semibold text-zinc-400">No exported projects yet</p>
              <p className="text-[11px] text-zinc-600 max-w-[200px] mt-1">
                Edit a video and hit &apos;Export&apos; or extract audio to save clips here.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-3"
              >
                {/* Icon / Media Type */}
                <div
                  className={`w-11 h-11 rounded-lg shrink-0 flex items-center justify-center text-white shadow-md ${
                    item.type === 'video'
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600'
                      : 'bg-gradient-to-tr from-rose-500 to-purple-600'
                  }`}
                >
                  {item.type === 'video' ? <Film className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                      {item.toolUsed}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{item.duration.toFixed(1)}s</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">{formatSize(item.blobSize)}</span>
                    <span>•</span>
                    <span className="text-zinc-500 uppercase">{item.format}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setActivePreviewUrl(item.blobUrl)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Preview Modal Overlay if clicked */}
        {activePreviewUrl && (
          <div className="absolute inset-0 bg-black/95 z-50 p-4 flex flex-col items-center justify-center">
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              <video src={activePreviewUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
