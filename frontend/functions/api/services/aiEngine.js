export const DISASTER_KEYWORDS = {
  Flood: [
    'water', 'flood', 'flooding', 'river', 'puddle', 'rain', 'submerged',
    'inundation', 'lake', 'stream', 'deluge', 'drain'
  ],
  Fire: [
    'fire', 'flame', 'smoke', 'wildfire', 'blaze', 'ash', 'burn',
    'inferno', 'bonfire', 'conflagration'
  ],
  Earthquake: [
    'rubble', 'ruins', 'debris', 'collapsed building', 'crack', 'earthquake',
    'destruction', 'masonry', 'demolition', 'broken wall'
  ],
  'Infrastructure Damage': [
    'destruction', 'collapsed', 'fallen tree', 'pothole', 'broken bridge',
    'sinkhole', 'road damage', 'crack', 'asphalt damage', 'trench'
  ]
};

export const CONTRADICTORY_KEYWORDS = {
  Fire: ['barbecue', 'grill', 'food', 'patio', 'indoor', 'party', 'dinner', 'cooking', 'picnic'],
  Flood: ['desert', 'sand', 'sunny', 'dry land', 'indoor office', 'couch'],
  Earthquake: ['intact building', 'modern architecture', 'bedroom', 'clean room'],
  'Infrastructure Damage': ['smooth road', 'new highway', 'clean street']
};

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export function evaluateEvidence({ disasterType, userSeverity, labels = [] }) {
  const normalizedLabels = labels.map(l => ({
    name: (l.name || l.Name || '').toLowerCase(),
    confidence: Number(l.confidence || l.Confidence || 0)
  }));

  const targetKeywords = (DISASTER_KEYWORDS[disasterType] || []).map(k => k.toLowerCase());
  const contradictoryKeywords = (CONTRADICTORY_KEYWORDS[disasterType] || []).map(k => k.toLowerCase());

  const matchingLabels = normalizedLabels.filter(nl =>
    targetKeywords.some(kw => nl.name.includes(kw) || kw.includes(nl.name))
  );

  const contradictingLabels = normalizedLabels.filter(nl =>
    contradictoryKeywords.some(cw => nl.name.includes(cw) || cw.includes(nl.name))
  );

  let aiVerification = 'INCONCLUSIVE';
  let dissonanceScore = 0.5;
  let aiSeverity = 'Medium';
  let negativeSpace = [];
  let aiSummary = '';

  const topMatch = matchingLabels[0];
  const hasHighConfidenceMatch = matchingLabels.some(m => m.confidence >= 70);
  const hasContradiction = contradictingLabels.length > 0 && matchingLabels.length === 0;

  if (hasContradiction) {
    aiVerification = 'INCONSISTENT';
    dissonanceScore = 0.88;
    aiSeverity = 'Low';
    negativeSpace = [
      `No ${disasterType.toLowerCase()} or active hazard signatures detected.`,
      'No emergency responder or structural failure indicators identified.'
    ];
    const detectedNames = contradictingLabels.slice(0, 3).map(c => c.name).join(', ');
    aiSummary = `The photo does not show evidence of ${disasterType.toLowerCase()}. Detected instead: ${detectedNames}. This indicates non-emergency domestic activity or a mislabeled report.`;
  } else if (hasHighConfidenceMatch) {
    aiVerification = 'CONSISTENT';
    dissonanceScore = topMatch.confidence >= 90 ? 0.08 : 0.22;
    aiSeverity = matchingLabels.length >= 3 || topMatch.confidence >= 95 ? 'Critical' : 'High';
    negativeSpace = [
      'No contradictory recreational or benign signatures detected.'
    ];
    const matchNames = matchingLabels.slice(0, 3).map(m => m.name).join(', ');
    aiSummary = `The photo reveals ${matchNames}, strongly corroborating the citizen ${disasterType.toLowerCase()} claim. Severity estimate: ${aiSeverity}.`;
  } else if (matchingLabels.length > 0) {
    aiVerification = 'INCONCLUSIVE';
    dissonanceScore = 0.45;
    aiSeverity = 'Low';
    negativeSpace = [
      'Visual signatures are low contrast or captured from distance.'
    ];
    aiSummary = `The photo is somewhat ambiguous — some visual signatures detected (${matchingLabels[0].name}), but confidence is moderate. Consider submitting a clearer photo.`;
  } else {
    aiVerification = 'INCONSISTENT';
    dissonanceScore = 0.78;
    aiSeverity = 'Low';
    negativeSpace = [
      `No confirmed ${disasterType.toLowerCase()} signatures detected in frame.`
    ];
    aiSummary = `The photo does not exhibit recognizable evidence of ${disasterType.toLowerCase()}. Re-examination recommended.`;
  }

  // Factor in severity mismatch
  const userSevIdx = SEVERITY_LEVELS.indexOf(userSeverity);
  const aiSevIdx = SEVERITY_LEVELS.indexOf(aiSeverity);
  if (userSevIdx !== -1 && aiSevIdx !== -1) {
    const sevDelta = Math.abs(userSevIdx - aiSevIdx);
    if (sevDelta >= 2 && dissonanceScore < 0.3) {
      dissonanceScore = Math.min(0.42, dissonanceScore + 0.2);
      aiSummary += ` Note: Citizen reported ${userSeverity} severity while visual evidence indicates ${aiSeverity}.`;
    }
  }

  return {
    aiVerification,
    dissonanceScore: Math.round(dissonanceScore * 100) / 100,
    aiSeverity,
    aiDetectedLabels: normalizedLabels.slice(0, 6).map(l => ({
      name: l.name.charAt(0).toUpperCase() + l.name.slice(1),
      confidence: Math.round(l.confidence * 10) / 10
    })),
    negativeSpace,
    aiSummary
  };
}
