/**
 * TwoTruths - Shared Data Contract & Schema Definitions
 */

export const DISASTER_TYPES = [
  'Flood',
  'Fire',
  'Earthquake',
  'Infrastructure Damage',
  'Other'
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const AI_VERIFICATIONS = ['CONSISTENT', 'INCONCLUSIVE', 'INCONSISTENT'];

export const VERIFICATION_STATUSES = [
  'PENDING',
  'AI_ASSESSED',
  'COMMUNITY_CONFIRMED',
  'DISPUTED'
];

export const DISSONANCE_ZONES = {
  ALIGNED: { label: 'Aligned', min: 0.0, max: 0.3, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  PARTIAL: { label: 'Partial', min: 0.3, max: 0.7, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  DIVERGENT: { label: 'Divergent', min: 0.7, max: 1.0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
};

export function getDissonanceZone(score) {
  if (score < 0.3) return DISSONANCE_ZONES.ALIGNED;
  if (score < 0.7) return DISSONANCE_ZONES.PARTIAL;
  return DISSONANCE_ZONES.DIVERGENT;
}

export const SEVERITY_WEIGHTS = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  Critical: 1.0,
  Unknown: 0.2
};

export function calculateTriageScore({ aiSeverity = 'Medium', corroborationCount = 1, dissonanceScore = 0.5 }) {
  const severityWeight = SEVERITY_WEIGHTS[aiSeverity] || 0.5;
  // Corroboration bonus capped at 4 reports
  const clusterWeight = Math.min(corroborationCount / 4, 1.0);
  const alignmentWeight = Math.max(0, 1 - dissonanceScore);

  const rawScore = (severityWeight * 0.4) + (clusterWeight * 0.3) + (alignmentWeight * 0.3);
  return Math.round(rawScore * 100) / 100;
}
