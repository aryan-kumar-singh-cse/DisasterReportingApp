/**
 * Disaster Report Schema Constants & Types
 */

export const DISASTER_TYPES = [
  'Flood',
  'Fire',
  'Earthquake',
  'Infrastructure Damage',
  'Other'
];

export const SEVERITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const AI_VERIFICATION_STATUSES = [
  'CONSISTENT',
  'INCONCLUSIVE',
  'INCONSISTENT'
];

export const REPORT_STATUSES = [
  'PENDING',
  'AI_ASSESSED',
  'COMMUNITY_CONFIRMED',
  'DISPUTED',
  'FALSE'
];

/**
 * Validates whether an object adheres to the disaster report contract.
 * @param {Object} report
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReport(report) {
  const errors = [];

  if (!report.reportId || typeof report.reportId !== 'string') {
    errors.push('Missing or invalid reportId');
  }
  if (!DISASTER_TYPES.includes(report.disasterType)) {
    errors.push(`Invalid disasterType: ${report.disasterType}`);
  }
  if (typeof report.latitude !== 'number' || report.latitude < -90 || report.latitude > 90) {
    errors.push(`Invalid latitude: ${report.latitude}`);
  }
  if (typeof report.longitude !== 'number' || report.longitude < -180 || report.longitude > 180) {
    errors.push(`Invalid longitude: ${report.longitude}`);
  }
  if (!SEVERITY_LEVELS.includes(report.userSeverity)) {
    errors.push(`Invalid userSeverity: ${report.userSeverity}`);
  }
  if (report.aiVerification && !AI_VERIFICATION_STATUSES.includes(report.aiVerification)) {
    errors.push(`Invalid aiVerification: ${report.aiVerification}`);
  }
  if (!REPORT_STATUSES.includes(report.verificationStatus)) {
    errors.push(`Invalid verificationStatus: ${report.verificationStatus}`);
  }
  if (typeof report.confirmVotes !== 'number' || report.confirmVotes < 0) {
    errors.push('confirmVotes must be a non-negative number');
  }
  if (typeof report.disputeVotes !== 'number' || report.disputeVotes < 0) {
    errors.push('disputeVotes must be a non-negative number');
  }
  if (!report.createdAt) {
    errors.push('Missing createdAt timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
