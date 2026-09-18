import { describe, it, expect } from 'vitest';
import { assessEvidence } from '../../../backend/src/services/aiService.js';

describe('AI Evidence Assessment Engine', () => {
  it('identifies CONSISTENT match when disaster keywords align with high confidence', () => {
    const labels = [
      { Name: 'Water', Confidence: 99.2 },
      { Name: 'Flood', Confidence: 97.4 },
      { Name: 'Puddle', Confidence: 91.0 }
    ];

    const result = assessEvidence('Flood', labels);
    expect(result.aiVerification).toBe('CONSISTENT');
    expect(result.aiSeverity).toBe('Critical');
    expect(result.matchingLabels.length).toBeGreaterThan(0);
  });

  it('identifies INCONSISTENT match when photo contains non-disaster domestic items', () => {
    const labels = [
      { Name: 'Dog', Confidence: 98.5 },
      { Name: 'Pet', Confidence: 96.0 },
      { Name: 'Living Room', Confidence: 89.2 }
    ];

    const result = assessEvidence('Fire', labels);
    expect(result.aiVerification).toBe('INCONSISTENT');
    expect(result.aiSeverity).toBe('Low');
  });

  it('returns INCONCLUSIVE when photo is ambiguous or low confidence', () => {
    const labels = [
      { Name: 'Outdoors', Confidence: 68.0 },
      { Name: 'Sky', Confidence: 66.5 }
    ];

    const result = assessEvidence('Earthquake', labels);
    expect(result.aiVerification).toBe('INCONCLUSIVE');
  });

  it('handles empty label array gracefully', () => {
    const result = assessEvidence('Flood', []);
    expect(result.aiVerification).toBe('INCONCLUSIVE');
    expect(result.matchingLabels).toEqual([]);
  });
});
