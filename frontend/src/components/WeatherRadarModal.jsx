import React, { useState } from 'react';
import {
  X,
  Radar,
  CloudRain,
  Wind,
  Sun,
  Layers,
  ExternalLink,
  MapPin
} from 'lucide-react';

export default function WeatherRadarModal({
  isOpen,
  onClose,
  city = 'Mumbai, MH',
  lat = 19.0760,
  lng = 72.8777
}) {
  const [activeLayer, setActiveLayer] = useState('rain');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const layerParams = {
    rain: 'rain',
    wind: 'wind',
    temp: 'temp',
    clouds: 'clouds'
  };

  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 19.0760;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 72.8777;

  const radarEmbedUrl = `https://embed.windy.com/embed2.html?lat=${safeLat}&lon=${safeLng}&detailLat=${safeLat}&detailLon=${safeLng}&width=650&height=450&zoom=7&level=surface&overlay=${layerParams[activeLayer] || 'rain'}&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl rounded-3xl bg-zinc-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>Interactive Live Weather Radar & Synoptic Map</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LIVE ECMWF
                </span>
              </h2>
              <p className="text-xs text-cyan-300/80 font-mono flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Centered on {city} ({safeLat.toFixed(2)}°N, {safeLng.toFixed(2)}°E)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://www.windy.com/?${safeLat},${safeLng},7`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-cyan-400 transition"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layer Selector Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/90 px-6 py-2.5 gap-2 overflow-x-auto scrollbar-none font-mono text-xs">
          <span className="text-zinc-400 flex items-center gap-1 mr-2 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radar Layers:</span>
          </span>

          <button
            onClick={() => setActiveLayer('rain')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeLayer === 'rain'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Precipitation (Rain/Doppler)</span>
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeLayer === 'wind'
                ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200 font-bold shadow-sm shadow-yellow-500/30'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-yellow-400" />
            <span>Wind Streamlines</span>
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeLayer === 'temp'
                ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-bold shadow-sm shadow-orange-500/30'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-orange-400" />
            <span>Temperature Heatmap</span>
          </button>
        </div>

        {/* Interactive Embedded Live Map */}
        <div className="relative flex-1 min-h-[440px] bg-black">
          <iframe
            src={radarEmbedUrl}
            className="w-full h-full min-h-[440px] border-none"
            loading="lazy"
            title="Live Weather Radar"
          />
        </div>
      </div>
    </div>
  );
}
