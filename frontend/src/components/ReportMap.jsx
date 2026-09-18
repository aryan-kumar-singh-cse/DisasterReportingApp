import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDissonanceZone } from '../data/schema';
import DissonanceMeter from './DissonanceMeter';
import { Layers, LocateFixed, Eye, ShieldAlert, Sparkles, Navigation, Globe, Loader2 } from 'lucide-react';

// Tile Providers for layer switching
// Tile Providers for layer switching (Satellite Aerial & Streets)
const TILE_LAYERS = {
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics',
    subdomains: ['server'],
    maxZoom: 19
  },
  streets: {
    name: 'Streets Nav',
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

// Smooth camera controller when selecting reports, searching location, or flying to GPS target
function MapFlyController({ selectedReport, searchLocation, flyTarget }) {
  const map = useMap();

  useEffect(() => {
    if (searchLocation && typeof searchLocation.lat === 'number' && typeof searchLocation.lng === 'number') {
      map.flyTo([searchLocation.lat, searchLocation.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [searchLocation, map]);

  useEffect(() => {
    if (flyTarget && typeof flyTarget.lat === 'number' && typeof flyTarget.lng === 'number' && !searchLocation) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom || 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [flyTarget, map, searchLocation]);

  useEffect(() => {
    if (selectedReport && typeof selectedReport.latitude === 'number' && typeof selectedReport.longitude === 'number' && !searchLocation) {
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedReport, map, searchLocation]);

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

export default function ReportMap({
  reports = [],
  selectedReport = null,
  onSelectReport = () => {},
  onOpenRadar = null,
  onOpenLightning = null,
  onOpenGlobe = null,
  searchLocation = null,
  onUserLocationFound = null,
  userGPS = null
}) {
  const [activeLayerKey, setActiveLayerKey] = useState('satellite');
  const [recenterFn, setRecenterFn] = useState(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [userGpsPosition, setUserGpsPosition] = useState(userGPS || null);

  // Sync external userGPS prop into local state
  useEffect(() => {
    if (userGPS) {
      setUserGpsPosition(userGPS);
    }
  }, [userGPS]);

  const handleLiveGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const gpsObj = { lat: latitude, lng: longitude, accuracy, zoom: 15 };
        setUserGpsPosition(gpsObj);
        setIsLocatingGPS(false);
        if (onUserLocationFound) onUserLocationFound(gpsObj);
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn(err);
        alert("Could not access your GPS location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const defaultCenter = useMemo(() => {
    if (searchLocation?.lat && searchLocation?.lng) {
      return [searchLocation.lat, searchLocation.lng];
    }
    if (selectedReport?.latitude && selectedReport?.longitude) {
      return [selectedReport.latitude, selectedReport.longitude];
    }
    if (reports.length > 0) {
      return [reports[0].latitude, reports[0].longitude];
    }
    return [19.0760, 72.8777]; // Mumbai center default
  }, [selectedReport, reports, searchLocation]);

  const activeLayer = TILE_LAYERS[activeLayerKey] || TILE_LAYERS.satellite;

  return (
    <div className="w-full h-full min-h-[400px] relative z-0 flex-1 overflow-hidden bg-zinc-950">
      {/* Floating Layer & Recenter Controls Toolbar */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-2xl select-none flex-wrap max-w-full justify-end">
        {/* Layer Switcher (Satellite & Streets) */}
        <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveLayerKey('satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeLayerKey === 'streets'
                ? 'bg-zinc-800 text-amber-300 shadow border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🗺️ Streets</span>
          </button>
        </div>

        {/* Live GPS Button (WeatherGPT Style) */}
        <button
          type="button"
          onClick={handleLiveGPS}
          disabled={isLocatingGPS}
          title="Fly to your exact live GPS location"
          className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shadow-sm ${
            isLocatingGPS
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 animate-pulse'
              : 'bg-zinc-900 hover:bg-cyan-950/60 text-cyan-300 border-zinc-800 hover:border-cyan-500/40'
          }`}
        >
          {isLocatingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="hidden sm:inline">{isLocatingGPS ? 'Locating...' : 'My GPS'}</span>
        </button>

        {/* 3D Globe Button */}
        {onOpenGlobe && (
          <button
            type="button"
            onClick={onOpenGlobe}
            title="Open 3D Planetary Disaster Globe"
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-indigo-950/60 text-indigo-300 border border-zinc-800 hover:border-indigo-500/40 transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">3D Globe</span>
          </button>
        )}

        {/* Recenter View Button */}
        {recenterFn && (
          <button
            type="button"
            onClick={recenterFn}
            title="Recenter view on all incidents"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        )}

        {/* Doppler Radar Button */}
        {onOpenRadar && (
          <button
            type="button"
            onClick={onOpenRadar}
            title="Live Doppler Weather Radar"
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>🌧️ Radar</span>
          </button>
        )}

        {/* Lightning Proximity Scope Button */}
        {onOpenLightning && (
          <button
            type="button"
            onClick={onOpenLightning}
            title="IITM / DAMINI Lightning & Convective Analyzer"
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-yellow-950/60 text-yellow-300 border border-yellow-500/30 hover:border-yellow-400 transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>⚡ Lightning</span>
          </button>
        )}
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px]"
        style={{ width: '100%', height: '100%', minHeight: '100%', background: '#05070d' }}
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
        <MapFlyController
          selectedReport={selectedReport}
          searchLocation={searchLocation}
          flyTarget={userGpsPosition}
        />
        <RecenterController reports={reports} onRecenterReady={setRecenterFn} />

        {/* Live User GPS Pulsing Pin */}
        {userGpsPosition && (
          <Marker
            position={[userGpsPosition.lat, userGpsPosition.lng]}
            icon={L.divIcon({
              className: 'custom-disaster-marker',
              html: `
                <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(6, 182, 212, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(6, 182, 212, 0.6);"></div>
                  <div style="width: 14px; height: 14px; border-radius: 50%; background: #06b6d4; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #06b6d4;"></div>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 17]
            })}
          >
            <Popup className="dark-popup">
              <div className="p-1.5 text-xs text-zinc-100">
                <span className="font-bold text-cyan-400 block mb-1">🎯 Your Exact GPS Position</span>
                <span className="text-[10px] font-mono text-zinc-300 block mb-1">
                  {userGpsPosition.lat.toFixed(5)}°N, {userGpsPosition.lng.toFixed(5)}°E
                </span>
                {userGpsPosition.accuracy && (
                  <span className="text-[9px] text-zinc-400 font-mono block mb-2">
                    Accuracy: ±{Math.round(userGpsPosition.accuracy)}m
                  </span>
                )}
                {onOpenRadar && (
                  <button
                    type="button"
                    onClick={() => onOpenRadar({ locationName: 'Your Live GPS Location', latitude: userGpsPosition.lat, longitude: userGpsPosition.lng })}
                    className="w-full py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                  >
                    <span>🌧️ Open Live Radar for My Location</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Target Searched Location Marker with High Visibility Radar Beacon */}
        {searchLocation && (
          <Marker
            position={[searchLocation.lat, searchLocation.lng]}
            icon={L.divIcon({
              className: 'custom-search-marker',
              html: `
                <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(14, 165, 233, 0.45); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(56, 189, 248, 0.6);"></div>
                  <div style="width: 18px; height: 18px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 16px #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 10px;">📍</div>
                </div>
              `,
              iconSize: [42, 42],
              iconAnchor: [21, 21],
              popupAnchor: [0, -20]
            })}
          >
            <Popup className="dark-popup" autoPan={true}>
              <div className="p-1.5 text-xs text-zinc-100">
                <span className="font-bold text-sky-400 block mb-1">📍 Searched: {searchLocation.name || 'Searched Location'}</span>
                <span className="text-[10px] font-mono text-zinc-300 block mb-1">
                  {searchLocation.lat.toFixed(4)}°N, {searchLocation.lng.toFixed(4)}°E
                </span>
                {searchLocation.state && (
                  <span className="text-[10px] text-zinc-400 block mb-2">
                    {[searchLocation.district, searchLocation.state, searchLocation.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {onOpenRadar && (
                  <button
                    type="button"
                    onClick={() => onOpenRadar({ locationName: searchLocation.name, latitude: searchLocation.lat, longitude: searchLocation.lng })}
                    className="w-full py-1.5 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                  >
                    <span>🌧️ Open Live Radar for {searchLocation.name}</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

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

                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => onSelectReport(rep)}
                      className="py-1.5 text-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                    >
                      Assessment
                    </button>
                    {onOpenRadar && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectReport(rep);
                          onOpenRadar(rep);
                        }}
                        className="py-1.5 text-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>🌧️ Radar</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
