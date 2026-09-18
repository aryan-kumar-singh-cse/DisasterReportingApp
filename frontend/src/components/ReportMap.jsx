import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { createCustomMarkerIcon } from '../utils/markerUtils';

/**
 * Helper component to automatically adjust map bounds or pan to selected report
 */
function MapViewUpdater({ center, zoom, selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 14, {
        duration: 1.2
      });
    }
  }, [selectedReport, map]);

  return null;
}

/**
 * Interactive Leaflet Map for Disaster Reports
 */
export default function ReportMap({
  reports = [],
  selectedReportId = null,
  onSelectReport,
  center = [19.0760, 72.8777],
  zoom = 12
}) {
  const selectedReport = reports.find(r => r.reportId === selectedReportId);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewUpdater
          center={center}
          zoom={zoom}
          selectedReport={selectedReport}
        />

        {reports.map((report) => {
          const isSelected = report.reportId === selectedReportId;
          const icon = createCustomMarkerIcon(
            report.disasterType,
            report.userSeverity,
            isSelected
          );

          return (
            <Marker
              key={report.reportId}
              position={[report.latitude, report.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectReport) {
                    onSelectReport(report);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px', maxWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                      {report.disasterType}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: report.userSeverity === 'Critical' ? '#ef4444' : '#f97316',
                      color: '#ffffff',
                      fontWeight: 600
                    }}>
                      {report.userSeverity}
                    </span>
                  </div>

                  {report.locationName && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      📍 {report.locationName}
                    </div>
                  )}

                  <p style={{ fontSize: '13px', margin: '6px 0', color: '#cbd5e1' }}>
                    {report.description ? (
                      report.description.length > 90 ? `${report.description.slice(0, 90)}...` : report.description
                    ) : 'No description provided.'}
                  </p>

                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: report.aiVerification === 'CONSISTENT' ? '#10b981' : (report.aiVerification === 'INCONSISTENT' ? '#ef4444' : '#f59e0b')
                    }}>
                      AI: {report.aiVerification || 'PENDING'}
                    </span>

                    <button
                      onClick={() => onSelectReport && onSelectReport(report)}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Inspect Details
                    </button>
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
