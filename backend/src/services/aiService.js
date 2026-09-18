/**
 * Rule-Based AI Evidence Assessment Engine
 * Compares labels from Rekognition against the user's claimed disaster type.
 */

export const DISASTER_KEYWORDS = {
  Flood: ['water', 'flood', 'flooding', 'river', 'puddle', 'rain', 'submerged', 'lake', 'sea', 'deluge'],
  Fire: ['fire', 'flame', 'smoke', 'wildfire', 'blaze', 'ash', 'bonfire', 'inferno', 'burn'],
  Earthquake: ['rubble', 'ruins', 'debris', 'collapsed building', 'crack', 'destruction', 'concrete'],
  'Infrastructure Damage': ['destruction', 'collapsed', 'fallen tree', 'pothole', 'broken bridge', 'damage', 'accident', 'tree', 'rubble']
};

/**
 * Assesses consistency between Rekognition detected labels and citizen's claimed disaster type
 * @param {string} claimedDisasterType
 * @param {Array<{ Name: string, Confidence: number }>} detectedLabels
 * @returns {{ aiVerification: string, aiSeverity: string, matchingLabels: Array, confidence: number }}
 */
export function assessEvidence(claimedDisasterType, detectedLabels = []) {
  if (!detectedLabels || detectedLabels.length === 0) {
    return {
      aiVerification: 'INCONCLUSIVE',
      aiSeverity: 'Low',
      matchingLabels: [],
      confidence: 0
    };
  }

  const normalizedClaim = claimedDisasterType || 'Other';
  const targetKeywords = DISASTER_KEYWORDS[normalizedClaim] || [];

  const matched = [];
  let maxConfidence = 0;

  for (const label of detectedLabels) {
    const nameLower = (label.Name || label.name || '').toLowerCase();
    const conf = label.Confidence || label.confidence || 0;

    for (const kw of targetKeywords) {
      if (nameLower.includes(kw) || kw.includes(nameLower)) {
        matched.push({ name: label.Name || label.name, confidence: conf });
        if (conf > maxConfidence) maxConfidence = conf;
        break;
      }
    }
  }

  // Check for contradiction or irrelevant subjects (e.g., domestic pets, food, interior furniture)
  const domesticKeywords = ['dog', 'cat', 'puppy', 'kitten', 'pet', 'furniture', 'couch', 'food', 'dessert'];
  const hasDomestic = detectedLabels.some(l =>
    domesticKeywords.includes((l.Name || l.name || '').toLowerCase()) && (l.Confidence || l.confidence || 0) > 85
  );

  let aiVerification = 'INCONCLUSIVE';
  if (matched.length >= 1 && maxConfidence >= 75) {
    aiVerification = 'CONSISTENT';
  } else if (hasDomestic && matched.length === 0) {
    aiVerification = 'INCONSISTENT';
  } else if (matched.length === 0 && detectedLabels.length >= 5) {
    aiVerification = 'INCONSISTENT';
  }

  // Severity heuristic based on label strength
  let aiSeverity = 'Low';
  if (matched.length >= 3 || maxConfidence > 92) {
    aiSeverity = 'Critical';
  } else if (matched.length >= 2 || maxConfidence > 80) {
    aiSeverity = 'High';
  } else if (matched.length >= 1) {
    aiSeverity = 'Medium';
  }

  return {
    aiVerification,
    aiSeverity,
    matchingLabels: matched,
    confidence: maxConfidence
  };
}
