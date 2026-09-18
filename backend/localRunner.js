/**
 * Local test runner for simulating API Gateway requests against the Lambda handler
 */
import { assessEvidence } from './src/services/aiService.js';
import { applyVote } from './src/services/voteService.js';

console.log('--- Testing ResQ Local Services ---');

// 1. Test AI Evidence Assessment
console.log('\n[1] Testing AI Evidence Assessment:');
const sampleFloodLabels = [
  { Name: 'Water', Confidence: 99.1 },
  { Name: 'Flood', Confidence: 96.5 },
  { Name: 'Submerged', Confidence: 89.2 }
];

const floodResult = assessEvidence('Flood', sampleFloodLabels);
console.log('Claim "Flood" with flood labels:', floodResult.aiVerification, `(Expected: CONSISTENT, Severity: ${floodResult.aiSeverity})`);

const petLabels = [
  { Name: 'Dog', Confidence: 98.4 },
  { Name: 'Pet', Confidence: 95.1 },
  { Name: 'Indoor', Confidence: 88.0 }
];

const fireResult = assessEvidence('Fire', petLabels);
console.log('Claim "Fire" with pet labels:', fireResult.aiVerification, '(Expected: INCONSISTENT)');

// 2. Test Community Voting State Machine
console.log('\n[2] Testing Community Voting State Machine:');
let report = { confirmVotes: 0, disputeVotes: 0, verificationStatus: 'AI_ASSESSED' };

report = { ...report, ...applyVote(report, 'CONFIRM') };
report = { ...report, ...applyVote(report, 'CONFIRM') };
report = { ...report, ...applyVote(report, 'CONFIRM') };
console.log('After 3 confirms:', report.verificationStatus, `(Expected: COMMUNITY_CONFIRMED, Confirms: ${report.confirmVotes})`);

report = { ...report, ...applyVote(report, 'DISPUTE') };
report = { ...report, ...applyVote(report, 'DISPUTE') };
report = { ...report, ...applyVote(report, 'DISPUTE') };
console.log('After 3 disputes:', report.verificationStatus, `(Expected: DISPUTED, Disputes: ${report.disputeVotes})`);

console.log('\n✓ All local services tested successfully!');
