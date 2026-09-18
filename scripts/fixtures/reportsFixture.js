/**
 * Curated Demo Incident Fixtures
 */

export const demoIncidentFixtures = [
  {
    reportId: 'rep-mumbai-flood-01',
    disasterType: 'Flood',
    description: 'Hindmata Junction severely inundated. Water levels above 3 feet, traffic completely halted. Stranded commuters assisting each other.',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0144,
    longitude: 72.8428,
    locationName: 'Hindmata, Dadar, Mumbai',
    userSeverity: 'Critical',
    aiSeverity: 'Critical',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Flood', confidence: 99.1 },
      { name: 'Water', confidence: 98.4 },
      { name: 'Submerged', confidence: 92.0 },
      { name: 'Vehicle', confidence: 87.3 }
    ],
    verificationStatus: 'COMMUNITY_CONFIRMED',
    confirmVotes: 22,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    reportId: 'rep-powai-fire-02',
    disasterType: 'Fire',
    description: 'Dry scrub fire along the forest edge near residential towers. Thick smoke drifting into apartment balconies.',
    photoUrl: 'https://images.unsplash.com/photo-1602980085566-4c227546cb5b?auto=format&fit=crop&w=800&q=80',
    latitude: 19.1245,
    longitude: 72.9056,
    locationName: 'Powai Ridge, Mumbai',
    userSeverity: 'High',
    aiSeverity: 'High',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Wildfire', confidence: 97.2 },
      { name: 'Smoke', confidence: 95.8 },
      { name: 'Flame', confidence: 91.5 }
    ],
    verificationStatus: 'AI_ASSESSED',
    confirmVotes: 8,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString()
  },
  {
    reportId: 'rep-false-fire-03',
    disasterType: 'Fire',
    description: 'Huge catastrophic fire destroying commercial complex! Send all fire trucks now!',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0728,
    longitude: 72.8826,
    locationName: 'BKC, Mumbai',
    userSeverity: 'Critical',
    aiSeverity: 'Low',
    aiVerification: 'INCONSISTENT',
    aiDetectedLabels: [
      { name: 'Dog', confidence: 99.4 },
      { name: 'Pet', confidence: 98.7 },
      { name: 'Living Room', confidence: 92.1 }
    ],
    verificationStatus: 'FALSE',
    confirmVotes: 0,
    disputeVotes: 29,
    createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString()
  },
  {
    reportId: 'rep-banyan-collapse-04',
    disasterType: 'Infrastructure Damage',
    description: 'Massive fallen tree crushed high-voltage electrical cable and crushed two parked cars. Road completely impassable.',
    photoUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    latitude: 18.9682,
    longitude: 72.8222,
    locationName: 'Byculla East, Mumbai',
    userSeverity: 'High',
    aiSeverity: 'High',
    aiVerification: 'CONSISTENT',
    aiDetectedLabels: [
      { name: 'Fallen Tree', confidence: 99.0 },
      { name: 'Tree', confidence: 98.2 },
      { name: 'Debris', confidence: 89.1 },
      { name: 'Road Block', confidence: 84.5 }
    ],
    verificationStatus: 'COMMUNITY_CONFIRMED',
    confirmVotes: 16,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString()
  },
  {
    reportId: 'rep-structural-05',
    disasterType: 'Earthquake',
    description: 'Deep diagonal shear cracks along the basement support column following mild tremors. Structural inspection urged.',
    photoUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    latitude: 19.0430,
    longitude: 72.8631,
    locationName: 'Bandra Kurla Complex, Mumbai',
    userSeverity: 'Medium',
    aiSeverity: 'Medium',
    aiVerification: 'INCONCLUSIVE',
    aiDetectedLabels: [
      { name: 'Wall', confidence: 78.4 },
      { name: 'Concrete', confidence: 73.1 },
      { name: 'Surface', confidence: 66.0 }
    ],
    verificationStatus: 'AI_ASSESSED',
    confirmVotes: 5,
    disputeVotes: 2,
    createdAt: new Date(Date.now() - 320 * 60 * 1000).toISOString()
  }
];
