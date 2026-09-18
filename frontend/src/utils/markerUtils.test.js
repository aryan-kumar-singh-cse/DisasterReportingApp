import { describe, it, expect } from 'vitest';
import { createCustomMarkerIcon, DISASTER_COLORS, DISASTER_ICONS } from '../utils/markerUtils';

describe('Map Marker Utilities', () => {
  it('defines distinct colors for all core disaster types', () => {
    expect(DISASTER_COLORS.Flood).toBe('#2563eb');
    expect(DISASTER_COLORS.Fire).toBe('#ea580c');
    expect(DISASTER_COLORS.Earthquake).toBe('#9333ea');
    expect(DISASTER_COLORS['Infrastructure Damage']).toBe('#475569');
  });

  it('defines distinct emoji icons for core disaster types', () => {
    expect(DISASTER_ICONS.Flood).toBe('🌊');
    expect(DISASTER_ICONS.Fire).toBe('🔥');
    expect(DISASTER_ICONS.Earthquake).toBe('🏚️');
    expect(DISASTER_ICONS['Infrastructure Damage']).toBe('⚠️');
  });

  it('generates a valid Leaflet divIcon with HTML snippet', () => {
    const icon = createCustomMarkerIcon('Flood', 'Critical', false);
    expect(icon).toBeDefined();
    expect(icon.options).toBeDefined();
    expect(icon.options.html).toContain('custom-map-pin');
    expect(icon.options.html).toContain('🌊');
    expect(icon.options.html).toContain('severity-critical');
    expect(icon.options.html).toContain('#2563eb');
  });

  it('applies selected highlighting when isSelected is true', () => {
    const icon = createCustomMarkerIcon('Fire', 'High', true);
    expect(icon.options.html).toContain('drop-shadow');
    expect(icon.options.html).toContain('scale(1.2)');
  });
});
