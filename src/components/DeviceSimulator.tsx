import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw, Battery, Wifi } from 'lucide-react';
import { DeviceMode, DeviceOrientation } from '../types.ts';

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  // Default to 'responsive' so app preview fills the preview container cleanly
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
  const [currentTimeStr, setCurrentTimeStr] = useState('9:41');
  const [isRealMobileOrTablet, setIsRealMobileOrTablet] = useState(false);

  useEffect(() => {
    // Detect if running on an actual mobile/tablet screen size
    const checkScreen = () => {
      const isMobileWidth = window.innerWidth <= 768;
      setIsRealMobileOrTablet(isMobileWidth);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Responsive mode: App fills the preview container 100%
  if (isRealMobileOrTablet || deviceMode === 'responsive') {
    return (
      <div className="w-full h-full min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none overflow-hidden">
        {/* Device toggle toolbar for desktop / large preview */}
        {!isRealMobileOrTablet && (
          <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-3.5 py-1.5 flex items-center justify-between z-40 shrink-0 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-zinc-300">Vivvyo Studio Active Preview</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                id="btn-switch-full"
                type="button"
                onClick={() => setDeviceMode('responsive')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-600 text-white flex items-center gap-1 shadow-sm"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Full Studio</span>
              </button>
              <button
                id="btn-switch-phone"
                type="button"
                onClick={() => setDeviceMode('phone')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors"
                title="Switch to Mobile Phone Frame"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phone (393px)</span>
              </button>
              <button
                id="btn-switch-tablet"
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors"
                title="Switch to Tablet Frame"
              >
                <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tablet (820px)</span>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 relative overflow-hidden flex flex-col">{children}</div>
      </div>
    );
  }

  // Calculate container dimensions for simulated phone/tablet frame
  let frameWidth = 393;
  let frameHeight = 852;

  if (deviceMode === 'tablet') {
    frameWidth = 820;
    frameHeight = 1080;
  }

  if (orientation === 'landscape') {
    const tmp = frameWidth;
    frameWidth = frameHeight;
    frameHeight = tmp;
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 select-none">
      {/* Top Device Switcher Toolbar */}
      <header className="mb-3 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md flex items-center space-x-2 z-30 shrink-0">
        <div className="flex items-center space-x-1 border-r border-zinc-700/60 pr-2">
          <button
            id="sim-full-btn"
            type="button"
            onClick={() => setDeviceMode('responsive')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Expand to Full View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Window</span>
          </button>

          <button
            id="sim-phone-btn"
            type="button"
            onClick={() => setDeviceMode('phone')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              deviceMode === 'phone'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (393px)</span>
          </button>

          <button
            id="sim-tablet-btn"
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              deviceMode === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (820px)</span>
          </button>
        </div>

        <button
          id="sim-orient-btn"
          type="button"
          onClick={() => setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
          title="Rotate Device Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span className="capitalize">{orientation}</span>
        </button>
      </header>

      {/* Simulated Device Frame */}
      <div
        className={`relative transition-all duration-300 ease-out bg-black shadow-2xl overflow-hidden border-[10px] border-zinc-800/90 ring-1 ring-white/10 shrink-0 ${
          deviceMode === 'phone'
            ? orientation === 'portrait'
              ? 'rounded-[48px]'
              : 'rounded-[38px]'
            : 'rounded-[36px]'
        }`}
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          maxHeight: 'calc(100vh - 65px)',
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        {/* Device Notch / Dynamic Island */}
        {orientation === 'portrait' && deviceMode === 'phone' && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-zinc-800/60 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-indigo-950/80 ring-1 ring-indigo-500/30" />
          </div>
        )}

        {/* Mobile OS Status Bar */}
        <div className="h-10 bg-transparent text-white px-6 pt-1.5 flex items-center justify-between text-xs font-semibold z-40 select-none pointer-events-none">
          <span className="tracking-tight text-[13px]">{currentTimeStr}</span>
          <div className="flex items-center space-x-2 text-zinc-300">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-tighter">5G</span>
            <div className="flex items-center space-x-0.5">
              <span className="text-[11px]">98%</span>
              <Battery className="w-4 h-4 text-emerald-400 rotate-90" />
            </div>
          </div>
        </div>

        {/* Inner App Container */}
        <main className="absolute inset-0 top-10 bottom-4 overflow-hidden flex flex-col bg-zinc-950 text-white">
          {children}
        </main>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-400/80 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};
