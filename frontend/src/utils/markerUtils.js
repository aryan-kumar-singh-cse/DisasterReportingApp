let L;
if (typeof window !== 'undefined') {
  // In browser runtime
  L = await import('leaflet').then(m => m.default || m);
}

export const DISASTER_COLORS = {
  Flood: '#2563eb',
  Fire: '#ea580c',
  Earthquake: '#9333ea',
  'Infrastructure Damage': '#475569',
  Other: '#0d9488'
};

export const DISASTER_ICONS = {
  Flood: '🌊',
  Fire: '🔥',
  Earthquake: '🏚️',
  'Infrastructure Damage': '⚠️',
  Other: '📍'
};

/**
 * Generates the HTML string for a custom marker pin
 */
export function getMarkerHtml(disasterType, severity, isSelected = false) {
  const color = DISASTER_COLORS[disasterType] || '#3b82f6';
  const icon = DISASTER_ICONS[disasterType] || '📍';
  const severityClass = `severity-${(severity || 'medium').toLowerCase()}`;
  const selectedStyle = isSelected ? 'filter: drop-shadow(0 0 10px #ffffff); transform: scale(1.2);' : '';

  return `
    <div class="custom-map-pin" style="${selectedStyle}">
      <div class="pin-bubble" style="background-color: ${color};">
        <span class="pin-icon-inner">${icon}</span>
      </div>
      <div class="pin-severity-indicator ${severityClass}"></div>
    </div>
  `;
}

/**
 * Creates a customized Leaflet divIcon representing a disaster marker
 * @param {string} disasterType
 * @param {string} severity
 * @param {boolean} isSelected
 * @returns {Object}
 */
export function createCustomMarkerIcon(disasterType, severity, isSelected = false) {
  const html = getMarkerHtml(disasterType, severity, isSelected);

  if (L && typeof L.divIcon === 'function') {
    return L.divIcon({
      html,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  }

  // Fallback / headless representation
  return {
    options: {
      html,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [38, 38]
    }
  };
}
