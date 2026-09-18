import { describe, it, expect } from 'vitest';
import { mockReports } from './mockReports';
import { validateReport, DISASTER_TYPES, SEVERITY_LEVELS, AI_VERIFICATION_STATUSES } from './schema';

describe('Schema and Mock Data Contract', () => {
  it('contains at least 4 distinct mock reports', () => {
    expect(mockReports.length).toBeGreaterThanOrEqual(4);
  });

  it('validates every report in mockReports adheres to the schema', () => {
    mockReports.forEach((report) => {
      const { valid, errors } = validateReport(report);
      expect(errors).toEqual([]);
      expect(valid).toBe(true);
    });
  });

  it('contains diverse AI verification states (CONSISTENT, INCONSISTENT, INCONCLUSIVE)', () => {
    const statuses = mockReports.map(r => r.aiVerification);
    expect(statuses).toContain('CONSISTENT');
    expect(statuses).toContain('INCONSISTENT');
    expect(statuses).toContain('INCONCLUSIVE');
  });

  it('catches invalid reports', () => {
    const invalidReport = {
      reportId: 'rep-invalid',
      disasterType: 'Volcano', // not in allowlist
      latitude: 200, // out of range
      longitude: 72.8,
      userSeverity: 'Extreme', // invalid severity
      verificationStatus: 'UNKNOWN',
      confirmVotes: -1,
      disputeVotes: 0,
      createdAt: ''
    };

    const { valid, errors } = validateReport(invalidReport);
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});
