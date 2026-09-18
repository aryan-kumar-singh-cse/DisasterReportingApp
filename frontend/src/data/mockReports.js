/**
 * Seed Reports for TwoTruths Demo Rehearsal
 */

export const INITIAL_MOCK_REPORTS = [
  {
    reportId: "rep-mumbai-001",
    disasterType: "Fire",
    userSeverity: "Critical",
    description: "Huge emergency fire spreading through residential apartments! Multiple flames visible, send fire engines urgently!",
    photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: "Bandra West, Mumbai",
    aiSeverity: "Low",
    aiVerification: "INCONSISTENT",
    dissonanceScore: 0.88,
    aiDetectedLabels: [
      { name: "Barbecue", confidence: 96.2 },
      { name: "Grill", confidence: 94.8 },
      { name: "Food", confidence: 91.5 },
      { name: "Outdoor Cooking", confidence: 88.0 },
      { name: "Patio", confidence: 85.3 }
    ],
    negativeSpace: [
      "No wildfire, structural fire, or smoke plume labels detected.",
      "No structural damage or emergency responder indicators identified."
    ],
    aiSummary: "The photo does not show evidence of fire disaster. Detected instead: outdoor grill, barbecue, food. This indicates a non-emergency domestic activity or mislabeled report.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [],
    triageScore: 0.17,
    verificationStatus: "AI_ASSESSED",
    confirmVotes: 1,
    disputeVotes: 6,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-mumbai-002",
    disasterType: "Flood",
    userSeverity: "Critical",
    description: "Flash flood waters rising rapidly on LBS Marg. Water is at car roof level and citizens are stranded inside a BEST bus!",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60",
    latitude: 19.0688,
    longitude: 72.8856,
    locationName: "Kurla West (LBS Marg), Mumbai",
    aiSeverity: "Critical",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.08,
    aiDetectedLabels: [
      { name: "Flood", confidence: 98.6 },
      { name: "Water Inundation", confidence: 97.4 },
      { name: "Submerged Vehicle", confidence: 94.2 },
      { name: "Rain Storm", confidence: 89.1 },
      { name: "Street Flooding", confidence: 87.5 }
    ],
    negativeSpace: [
      "No contradictory outdoor recreation or leisure activities detected."
    ],
    aiSummary: "The photo reveals severe roadway inundation and submerged passenger vehicles, strongly corroborating the citizen flood claim. Immediate rescue escalation warranted.",
    clusterId: "cluster-kurla-flood",
    clusterCount: 3,
    challengeHistory: [],
    triageScore: 0.98,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 19,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-mumbai-003",
    disasterType: "Flood",
    userSeverity: "High",
    description: "Ground floor residential compound completely flooded, water level approaching electrical substation.",
    photoUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=60",
    latitude: 19.0650,
    longitude: 72.8820,
    locationName: "Kurla Station Road, Mumbai",
    aiSeverity: "High",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.12,
    aiDetectedLabels: [
      { name: "Flood", confidence: 95.8 },
      { name: "Water", confidence: 96.1 },
      { name: "Building Inundation", confidence: 85.3 }
    ],
    negativeSpace: [],
    aiSummary: "Substantial water accumulation surrounding residential building, consistent with claimed flood severity.",
    clusterId: "cluster-kurla-flood",
    clusterCount: 3,
    challengeHistory: [],
    triageScore: 0.86,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 12,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-delhi-005",
    disasterType: "Infrastructure Damage",
    userSeverity: "Critical",
    description: "Entire arterial ring road collapsed! Massive canyon sinkhole, completely impassable!",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60",
    latitude: 28.6139,
    longitude: 77.2090,
    locationName: "Connaught Place Outer Ring, New Delhi",
    aiSeverity: "Low",
    aiVerification: "INCONCLUSIVE",
    dissonanceScore: 0.54,
    aiDetectedLabels: [
      { name: "Asphalt", confidence: 94.1 },
      { name: "Pothole", confidence: 88.3 },
      { name: "Street Road", confidence: 92.5 },
      { name: "Pavement Crack", confidence: 79.4 }
    ],
    negativeSpace: [
      "No bridge collapse, structural concrete failure, or canyon-scale sinkhole detected."
    ],
    aiSummary: "Surface road degradation (isolated pothole) detected. Visual evidence does not corroborate catastrophic structural collapse. AI estimated severity: Low.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [],
    triageScore: 0.44,
    verificationStatus: "AI_ASSESSED",
    confirmVotes: 3,
    disputeVotes: 7,
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-bengaluru-006",
    disasterType: "Fire",
    userSeverity: "High",
    description: "Industrial warehouse fire in Peenya phase 2. Massive smoke billowing from building roof.",
    photoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60",
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: "Peenya Industrial Area, Bengaluru",
    aiSeverity: "High",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.14,
    aiDetectedLabels: [
      { name: "Smoke Plume", confidence: 97.1 },
      { name: "Fire", confidence: 94.3 },
      { name: "Industrial Structure", confidence: 89.6 },
      { name: "Flame", confidence: 88.2 }
    ],
    negativeSpace: [],
    aiSummary: "Active structural industrial fire with towering smoke plume detected. Assessment successfully updated to CONSISTENT following citizen photo challenge.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [
      {
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        photoUrl: "https://images.unsplash.com/photo-1487621167305-5d248087c724?w=800&auto=format&fit=crop&q=60",
        contextNote: "Initial photo was captured from 1km distance through tree foliage, base was hidden.",
        aiVerification: "INCONCLUSIVE",
        dissonanceScore: 0.65,
        aiSummary: "Distant tree line and low contrast atmospheric haze. Inconclusive verification of active flame."
      }
    ],
    triageScore: 0.81,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 10,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-delhi-007",
    disasterType: "Earthquake",
    userSeverity: "Critical",
    description: "Two-story heritage structure partially collapsed after tremor, rubble spilling into pedestrian alley.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=800&auto=format&fit=crop&q=60",
    latitude: 28.6500,
    longitude: 77.2300,
    locationName: "Old Delhi Bazaar, New Delhi",
    aiSeverity: "Critical",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.16,
    aiDetectedLabels: [
      { name: "Rubble", confidence: 96.5 },
      { name: "Ruins", confidence: 93.8 },
      { name: "Collapsed Wall", confidence: 91.2 },
      { name: "Debris Field", confidence: 89.4 }
    ],
    negativeSpace: [],
    aiSummary: "Severe structural fragmentation and masonry rubble detected, directly corroborating earthquake damage claim.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [],
    triageScore: 0.92,
    verificationStatus: "AI_ASSESSED",
    confirmVotes: 15,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];
