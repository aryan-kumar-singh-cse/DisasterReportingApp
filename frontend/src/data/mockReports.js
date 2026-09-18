/**
 * Realistic Mock Disaster Reports Dataset for Local Development
 */

export const mockReports = [
  {
    reportId: 'rep-flood-101',
    disasterType: 'Flood',
    description: 'Heavy flash flooding along the arterial road. Water levels reaching knee-to-waist height. Vehicles submerged.',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: 'Dadar West, Mumbai',
    userSeverity: 'Critical',
    aiSeverity: 'Critical',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Water', confidence: 99.4 },
      { name: 'Flood', confidence: 97.8 },
      { name: 'Submerged', confidence: 91.2 },
      { name: 'Vehicle', confidence: 88.5 }
    ],
    verificationStatus: 'COMMUNITY_CONFIRMED',
    confirmVotes: 18,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 mins ago
  },
  {
    reportId: 'rep-fire-102',
    disasterType: 'Fire',
    description: 'Dry brush fire spreading rapidly along the residential ridge. Thick black smoke plumes visible from highway.',
    photoUrl: 'https://images.unsplash.com/photo-1602980085566-4c227546cb5b?auto=format&fit=crop&w=800&q=80',
    latitude: 19.1136,
    longitude: 72.8697,
    locationName: 'Powai Hills, Mumbai',
    userSeverity: 'High',
    aiSeverity: 'High',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Fire', confidence: 98.7 },
      { name: 'Smoke', confidence: 96.4 },
      { name: 'Flame', confidence: 93.1 },
      { name: 'Wildfire', confidence: 85.9 }
    ],
    verificationStatus: 'AI_ASSESSED',
    confirmVotes: 9,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() // 55 mins ago
  },
  {
    reportId: 'rep-inconsistent-103',
    disasterType: 'Fire',
    description: 'Major fire breaking out in downtown street! Everyone evacuate immediately!',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0178,
    longitude: 72.8478,
    locationName: 'Worli Seaface, Mumbai',
    userSeverity: 'Critical',
    aiSeverity: 'Low',
    aiVerification: 'INCONSISTENT',
    aiDetectedLabels: [
      { name: 'Dog', confidence: 99.1 },
      { name: 'Pet', confidence: 98.2 },
      { name: 'Canine', confidence: 95.0 },
      { name: 'Living Room', confidence: 89.4 }
    ],
    verificationStatus: 'FALSE',
    confirmVotes: 0,
    disputeVotes: 24,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString() // 110 mins ago
  },
  {
    reportId: 'rep-infra-104',
    disasterType: 'Infrastructure Damage',
    description: 'Uprooted banyan tree collapsed onto power cables and blocking both lanes. Emergency access obstructed.',
    photoUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    latitude: 18.9894,
    longitude: 72.8295,
    locationName: 'Parel Junction, Mumbai',
    userSeverity: 'Medium',
    aiSeverity: 'Medium',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Tree', confidence: 99.2 },
      { name: 'Fallen Tree', confidence: 92.6 },
      { name: 'Obstacle', confidence: 87.3 },
      { name: 'Road', confidence: 85.1 }
    ],
    verificationStatus: 'COMMUNITY_CONFIRMED',
    confirmVotes: 14,
    disputeVotes: 2,
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString() // 3 hrs ago
  },
  {
    reportId: 'rep-ambiguous-105',
    disasterType: 'Earthquake',
    description: 'Cracks appearing on the exterior structural pillar after ground tremors felt.',
    photoUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0410,
    longitude: 72.8550,
    locationName: 'Bandra East, Mumbai',
    userSeverity: 'High',
    aiSeverity: 'Medium',
    aiVerification: 'INCONCLUSIVE',
    aiDetectedLabels: [
      { name: 'Concrete', confidence: 76.1 },
      { name: 'Wall', confidence: 71.4 },
      { name: 'Surface', confidence: 68.0 }
    ],
    verificationStatus: 'AI_ASSESSED',
    confirmVotes: 4,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString() // 4 hrs ago
  }
];
