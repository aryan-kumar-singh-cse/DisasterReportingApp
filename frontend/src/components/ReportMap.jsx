import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDissonanceZone } from '../data/schema';
import DissonanceMeter from './DissonanceMeter';
import { Layers, LocateFixed, Eye, ShieldAlert, Sparkles } from 'lucide-react';

// Tile Providers for layer switching
const TILE_LAYERS = {
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 20
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics',
    subdomains: ['server'],
    maxZoom: 19
  },
  streets: {
    name: 'OpenStreet',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19
  }
};

// Auto-resizer component to eliminate Leaflet grey tiles and resize glitches
function MapResizeHandler({ selectedReportId }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately and after layout paint
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);

    const onWindowResize = () => map.invalidateSize();
    window.addEventListener('resize', onWindowResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', onWindowResize);
    };
  }, [map, selectedReportId]);

  return null;
}

// Smooth camera controller when selecting reports
function MapFlyController({ selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (selectedReport && typeof selectedReport.latitude === 'number' && typeof selectedReport.longitude === 'number') {
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedReport, map]);

  return null;
}

// Recenter Map Button Controller
function RecenterController({ reports, onRecenterReady }) {
  const map = useMap();

  useEffect(() => {
    if (onRecenterReady) {
      onRecenterReady(() => {
        if (reports.length === 0) return;
        if (reports.length === 1) {
          map.flyTo([reports[0].latitude, reports[0].longitude], 12);
          return;
        }
        const bounds = L.latLngBounds(reports.map(r => [r.latitude, r.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, duration: 1.2 });
      });
    }
  }, [map, reports, onRecenterReady]);

  return null;
}

// High-impact Custom Disaster Pin with Glowing Dissonance Radar Ring
function createCustomPin(disasterType, dissonanceScore, isSelected) {
  const zone = getDissonanceZone(dissonanceScore || 0);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Fire': return '#ef4444';
      case 'Flood': return '#3b82f6';
      case 'Earthquake': return '#a855f7';
      case 'Infrastructure Damage': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const typeColor = getTypeColor(disasterType);
  const isDivergent = (dissonanceScore || 0) >= 0.7;

  const html = `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <!-- Pulsing Radar Halo for Divergent Alerts -->
      ${isDivergent ? `
        <div style="
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid ${zone.color};
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.75;
        "></div>
      ` : ''}

      <!-- Glowing Dissonance Zone Ring -->
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid ${zone.color};
        background: rgba(9, 9, 11, 0.9);
        box-shadow: 0 0 14px ${zone.color}cc;
      "></div>

      <!-- Center Disaster Icon Badge -->
      <div style="
        position: relative;
        z-index: 2;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: ${typeColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.6);
      ">
        ${disasterType.charAt(0)}
      </div>

      <!-- Pointing Tip -->
      <div style="
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${zone.color};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-disaster-marker',
    iconSize: [44, 50],
    iconAnchor: [22, 50],
    popupAnchor: [0, -45]
  });
}

export default function ReportMap({ reports = [], selectedReport, onSelectReport }) {
  const [activeLayerKey, setActiveLayerKey] = useState('dark');
  const [recenterFn, setRecenterFn] = useState(null);

  const defaultCenter = useMemo(() => {
    if (selectedReport?.latitude && selectedReport?.longitude) {
      return [selectedReport.latitude, selectedReport.longitude];
    }
    if (reports.length > 0) {
      return [reports[0].latitude, reports[0].longitude];
    }
    return [19.0760, 72.8777]; // Mumbai center default
  }, [selectedReport, reports]);

  const activeLayer = TILE_LAYERS[activeLayerKey] || TILE_LAYERS.dark;

  return (
    <div className="w-full h-full min-h-[400px] relative z-0 flex-1 overflow-hidden bg-zinc-950">
      {/* Floating Layer & Recenter Controls Toolbar */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-2xl select-none">
        {/* Layer Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveLayerKey('dark')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              activeLayerKey === 'dark'
                ? 'bg-zinc-800 text-cyan-300 shadow border border-cyan-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🌑 Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerKey('satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              activeLayerKey === 'satellite'
                ? 'bg-zinc-800 text-emerald-300 shadow border border-emerald-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🛰️ Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerKey('streets')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              activeLayerKey === 'streets'
                ? 'bg-zinc-800 text-amber-300 shadow border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🗺️ Streets</span>
          </button>
        </div>

        {/* Recenter View Button */}
        {recenterFn && (
          <button
            type="button"
            onClick={recenterFn}
            title="Recenter view on all incidents"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        )}
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px]"
        style={{ width: '100%', height: '100%', minHeight: '100%', background: '#09090b' }}
      >
        <TileLayer
          key={activeLayerKey}
          url={activeLayer.url}
          attribution={activeLayer.attribution}
          subdomains={activeLayer.subdomains}
          maxZoom={activeLayer.maxZoom}
        />

        {/* Controllers */}
        <MapResizeHandler selectedReportId={selectedReport?.reportId} />
        <MapFlyController selectedReport={selectedReport} />
        <RecenterController reports={reports} onRecenterReady={setRecenterFn} />

        {/* Markers */}
        {reports.map((rep) => {
          if (typeof rep.latitude !== 'number' || typeof rep.longitude !== 'number') return null;
          const isSelected = selectedReport?.reportId === rep.reportId;
          const pinIcon = createCustomPin(rep.disasterType, rep.dissonanceScore, isSelected);

          return (
            <Marker
              key={rep.reportId}
              position={[rep.latitude, rep.longitude]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onSelectReport(rep)
              }}
            >
              <Popup className="dark-popup">
                <div className="p-1.5 max-w-[250px] text-zinc-200 select-none">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white">{rep.disasterType}</span>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {rep.userSeverity}
                    </span>
                  </div>

                  <div className="rounded-lg overflow-hidden mb-2 aspect-video bg-zinc-900 border border-zinc-800">
                    <img src={rep.photoUrl} alt="Report preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="mb-2.5">
                    <DissonanceMeter
                      score={rep.dissonanceScore || 0}
                      compact={true}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-300 line-clamp-2 mb-2 italic">
                    "{rep.description}"
                  </p>

                  <button
                    type="button"
                    onClick={() => onSelectReport(rep)}
                    className="w-full py-1.5 text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow transition-all"
                  >
                    Open Deep Assessment
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
