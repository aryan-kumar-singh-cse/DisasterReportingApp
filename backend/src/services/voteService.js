/**
 * Community Voting State Transition Engine
 */

export const VOTE_THRESHOLDS = {
  MIN_CONFIRMS: 3,
  MIN_DISPUTES: 3
};

/**
 * Calculates new vote counts and transitions verification status
 * @param {Object} report
 * @param {'CONFIRM' | 'DISPUTE'} voteType
 * @returns {{ confirmVotes: number, disputeVotes: number, verificationStatus: string }}
 */
export function applyVote(report, voteType) {
  const currentConfirm = report.confirmVotes || 0;
  const currentDispute = report.disputeVotes || 0;

  const newConfirm = voteType === 'CONFIRM' ? currentConfirm + 1 : currentConfirm;
  const newDispute = voteType === 'DISPUTE' ? currentDispute + 1 : currentDispute;

  let newStatus = report.verificationStatus || 'AI_ASSESSED';

  if (newConfirm >= VOTE_THRESHOLDS.MIN_CONFIRMS && newConfirm > newDispute * 2) {
    newStatus = 'COMMUNITY_CONFIRMED';
  } else if (newDispute >= VOTE_THRESHOLDS.MIN_DISPUTES && newDispute >= newConfirm) {
    newStatus = 'DISPUTED';
  }

  return {
    confirmVotes: newConfirm,
    disputeVotes: newDispute,
    verificationStatus: newStatus
  };
}
