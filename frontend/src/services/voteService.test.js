import { describe, it, expect } from 'vitest';
import { applyVote, VOTE_THRESHOLDS } from '../../../backend/src/services/voteService.js';

describe('Community Voting State Machine', () => {
  it('increments confirm votes atomically and transitions to COMMUNITY_CONFIRMED at threshold', () => {
    let report = { confirmVotes: 0, disputeVotes: 0, verificationStatus: 'AI_ASSESSED' };

    report = { ...report, ...applyVote(report, 'CONFIRM') };
    expect(report.confirmVotes).toBe(1);
    expect(report.verificationStatus).toBe('AI_ASSESSED');

    report = { ...report, ...applyVote(report, 'CONFIRM') };
    report = { ...report, ...applyVote(report, 'CONFIRM') };
    expect(report.confirmVotes).toBe(3);
    expect(report.verificationStatus).toBe('COMMUNITY_CONFIRMED');
  });

  it('increments dispute votes and transitions to DISPUTED at threshold', () => {
    let report = { confirmVotes: 1, disputeVotes: 0, verificationStatus: 'AI_ASSESSED' };

    report = { ...report, ...applyVote(report, 'DISPUTE') };
    report = { ...report, ...applyVote(report, 'DISPUTE') };
    report = { ...report, ...applyVote(report, 'DISPUTE') };

    expect(report.disputeVotes).toBe(3);
    expect(report.verificationStatus).toBe('DISPUTED');
  });

  it('does not transition to confirmed if disputes are high', () => {
    let report = { confirmVotes: 2, disputeVotes: 3, verificationStatus: 'DISPUTED' };
    report = { ...report, ...applyVote(report, 'CONFIRM') };

    expect(report.confirmVotes).toBe(3);
    // 3 is not > 3 * 2 (6), so remains DISPUTED
    expect(report.verificationStatus).toBe('DISPUTED');
  });
});
