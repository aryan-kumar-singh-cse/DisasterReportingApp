import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Camera, MapPin, AlertCircle, Loader2, X } from 'lucide-react';
import { DISASTER_TYPES, SEVERITY_LEVELS } from '../data/schema';

// Mini-map draggable pin handler
function DraggableMarker({ position, onPositionChange }) {
  const markerIcon = useMemo(() => {
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
        </div>
      `,
      className: 'mini-map-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  }, []);

  const map = useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });

  return (
    <Marker
      position={position}
      draggable={true}
      icon={markerIcon}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onPositionChange([pos.lat, pos.lng]);
        }
      }}
    />
  );
}

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [disasterType, setDisasterType] = useState('Flood');
  const [userSeverity, setUserSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [coordinates, setCoordinates] = useState([19.0760, 72.8777]);
  const [gpsStatus, setGpsStatus] = useState('Fetching GPS...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fetch GPS on modal open
  useEffect(() => {
    if (isOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates([position.coords.latitude, position.coords.longitude]);
            setGpsStatus('GPS Acquired');
          },
          (err) => {
            console.warn('GPS lookup failed, using default coordinate', err);
            setGpsStatus('Using default location (drag pin to adjust)');
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setGpsStatus('Geolocation not supported');
      }
    }
  }, [isOpen]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Photo must be under 8MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      setErrorMessage('Please capture or select an incident photograph');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSubmit({
        disasterType,
        userSeverity,
        description,
        photoFile,
        latitude: coordinates[0],
        longitude: coordinates[1]
      });
      // Reset form
      setPhotoFile(null);
      setPhotoPreview(null);
      setDescription('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
              Submit Anonymous Incident Report
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              No login required. Your report will be evaluated by AI and published on the public map.
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fca5a5',
            fontSize: '12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo Upload Zone */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Incident Photo (Required for AI Evidence Assessment)
            </label>

            {photoPreview ? (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '160px', border: '1px solid #334155' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '120px',
                border: '2px dashed #475569',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#0f172a',
                transition: 'border-color 0.2s'
              }}>
                <Camera size={26} color="#38bdf8" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc' }}>
                  Tap to upload incident photo
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>JPEG or PNG up to 8MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Disaster Type Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Disaster Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {DISASTER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDisasterType(type)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '6px',
                    border: disasterType === type ? '2px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: disasterType === type ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                    color: disasterType === type ? '#38bdf8' : '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Estimated Severity
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {SEVERITY_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUserSeverity(lvl)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: userSeverity === lvl ? '2px solid #ef4444' : '1px solid #334155',
                    backgroundColor: userSeverity === lvl ? 'rgba(239, 68, 68, 0.25)' : '#0f172a',
                    color: userSeverity === lvl ? '#f87171' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mini-Map Pin Adjuster */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                Incident Location (Drag pin or click to adjust)
              </label>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>{gpsStatus}</span>
            </div>
            <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
              <MapContainer
                center={coordinates}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker position={coordinates} onPositionChange={setCoordinates} />
              </MapContainer>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              GPS: {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
              Additional Context / Urgent Rescue Needs
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Water rising past doorstep, elderly resident trapped on upper level..."
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                padding: '8px 10px',
                fontSize: '13px',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Evidence...</span>
                </>
              ) : (
                <span>Submit Anonymous Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
