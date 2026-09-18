import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDissonanceZone } from '../data/schema';
import DissonanceMeter from './DissonanceMeter';

// Smooth Map Flying Controller
function FlyToMarker({ selectedReport }) {
  const map = useMap();
  useEffect(() => {
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 14, {
        duration: 1.5
      });
    }
  }, [selectedReport, map]);
  return null;
}

// Custom SVG Disaster Pin with Dissonance Glowing Ring
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

  const svgHtml = `
    <div style="
      position: relative;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: transform 0.2s ease;
    ">
      <!-- Glowing Outer Ring indicating Dissonance Zone -->
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid ${zone.color};
        background: rgba(15, 23, 42, 0.85);
        box-shadow: 0 0 12px ${zone.color}aa;
      "></div>

      <!-- Core Disaster Symbol -->
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
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
      ">
        ${disasterType.charAt(0)}
      </div>

      <!-- Anchor point marker -->
      <div style="
        position: absolute;
        bottom: -6px;
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
    html: svgHtml,
    className: 'custom-disaster-marker',
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -40]
  });
}

export default function ReportMap({ reports = [], selectedReport, onSelectReport }) {
  // Center roughly over India or active reports
  const defaultCenter = selectedReport
    ? [selectedReport.latitude, selectedReport.longitude]
    : [19.0760, 72.8777]; // Mumbai center

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: '#09090b' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <FlyToMarker selectedReport={selectedReport} />

        {reports.map((rep) => {
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
                <div className="p-1 max-w-[240px] text-zinc-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{rep.disasterType}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{rep.userSeverity}</span>
                  </div>

                  <div className="rounded overflow-hidden mb-1.5 aspect-video bg-zinc-900">
                    <img src={rep.photoUrl} alt="Report" className="w-full h-full object-cover" />
                  </div>

                  <div className="mb-2">
                    <DissonanceMeter
                      score={rep.dissonanceScore || 0}
                      compact={true}
                    />
                  </div>

                  <button
                    onClick={() => onSelectReport(rep)}
                    className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
                  >
                    Inspect Report
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
