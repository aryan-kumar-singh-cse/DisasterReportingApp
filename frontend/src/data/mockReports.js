/**
 * Seed Reports for TwoTruths Demo Rehearsal
 */

export const INITIAL_MOCK_REPORTS = [
  {
    reportId: "rep-up-modinagar-001",
    disasterType: "Flood",
    userSeverity: "Critical",
    description: "Severe convective squall and cloudburst runoff flooding NH-58 Delhi-Meerut highway and low-lying perimeter around SRMIST Modinagar campus. Rapid storm water accumulation.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60",
    latitude: 28.8354,
    longitude: 77.5847,
    locationName: "SRMIST Campus & NH-58 Corridor, Modinagar (UP)",
    aiSeverity: "Critical",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.07,
    aiDetectedLabels: [
      { name: "Convective Squall", confidence: 98.2 },
      { name: "Highway Water Inundation", confidence: 96.7 },
      { name: "Storm Drainage Overflow", confidence: 94.1 },
      { name: "Submerged Vehicle Path", confidence: 91.5 },
      { name: "Monsoonal Downpour", confidence: 89.0 }
    ],
    negativeSpace: [
      "No recreational water activity or domestic drainage leak detected.",
      "High Doppler radar reflectivity (48 dBZ) corroborates storm cell above sector."
    ],
    aiSummary: "Doppler radar & satellite imagery corroborate severe squall-line inundation along the Modinagar highway corridor and campus perimeter. Water level actively rising.",
    clusterId: "cluster-modinagar-squall",
    clusterCount: 4,
    challengeHistory: [],
    triageScore: 0.97,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 28,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-mumbai-002",
    disasterType: "Flood",
    userSeverity: "Critical",
    description: "Flash flood waters rising rapidly on LBS Marg. Water is at car roof level and citizens are stranded inside a BEST bus near Mithi River overflow point.",
    photoUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=60",
    latitude: 19.0688,
    longitude: 72.8856,
    locationName: "Kurla West (LBS Marg & Mithi River), Mumbai",
    aiSeverity: "Critical",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.08,
    aiDetectedLabels: [
      { name: "Flood Surge", confidence: 98.6 },
      { name: "Water Inundation", confidence: 97.4 },
      { name: "Submerged Passenger Transit", confidence: 94.2 },
      { name: "Monsoon Storm", confidence: 89.1 },
      { name: "Street Flooding", confidence: 87.5 }
    ],
    negativeSpace: [
      "No contradictory outdoor recreation or normal tidal pool detected."
    ],
    aiSummary: "The imagery reveals severe roadway inundation and submerged passenger vehicles, strongly corroborating the citizen flood claim. Urgent NDRF boat extraction dispatched.",
    clusterId: "cluster-kurla-flood",
    clusterCount: 5,
    challengeHistory: [],
    triageScore: 0.98,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 34,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-assam-003",
    disasterType: "Flood",
    userSeverity: "High",
    description: "Brahmaputra River overflowed embankment perimeter. Agricultural lands and low-lying riverside settlement submerged, 14 families stranded.",
    photoUrl: "https://images.unsplash.com/photo-1508873696983-2df5703bc225?w=800&auto=format&fit=crop&q=60",
    latitude: 26.1445,
    longitude: 91.7362,
    locationName: "Brahmaputra Basin, Guwahati (Assam)",
    aiSeverity: "High",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.11,
    aiDetectedLabels: [
      { name: "River Flood", confidence: 97.4 },
      { name: "Breached Embankment", confidence: 95.1 },
      { name: "Rural Inundation", confidence: 92.3 }
    ],
    negativeSpace: [],
    aiSummary: "Satellite SAR telemetry indicates active riverine breach and sheet flow across riverbanks. Matches Central Water Commission (CWC) critical warning.",
    clusterId: "cluster-assam-flood",
    clusterCount: 3,
    challengeHistory: [],
    triageScore: 0.91,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 21,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-delhi-007",
    disasterType: "Earthquake",
    userSeverity: "Critical",
    description: "Two-story heritage structure partially collapsed following M4.8 tremor along Himalayan tectonic boundary, rubble spilling into pedestrian alley.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=800&auto=format&fit=crop&q=60",
    latitude: 28.6500,
    longitude: 77.2300,
    locationName: "Old Delhi Heritage Corridor, New Delhi",
    aiSeverity: "Critical",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.14,
    aiDetectedLabels: [
      { name: "Rubble Debris", confidence: 96.5 },
      { name: "Structural Failure", confidence: 93.8 },
      { name: "Collapsed Masonry", confidence: 91.2 },
      { name: "Debris Field", confidence: 89.4 }
    ],
    negativeSpace: [
      "No controlled construction excavation or planned demolition signs detected."
    ],
    aiSummary: "Severe structural fragmentation and masonry rubble detected, corroborating national seismology center telemetry (NCS) ground shaking index.",
    clusterId: null,
    clusterCount: 2,
    challengeHistory: [],
    triageScore: 0.93,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 19,
    disputeVotes: 0,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-bengaluru-006",
    disasterType: "Fire",
    userSeverity: "High",
    description: "Industrial warehouse fire in Peenya phase 2. Massive chemical smoke billowing from building roof and adjacent storage silos.",
    photoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60",
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: "Peenya Industrial Area Phase 2, Bengaluru",
    aiSeverity: "High",
    aiVerification: "CONSISTENT",
    dissonanceScore: 0.12,
    aiDetectedLabels: [
      { name: "Industrial Smoke Plume", confidence: 97.5 },
      { name: "Structural Blaze", confidence: 94.3 },
      { name: "Commercial Structure", confidence: 89.6 },
      { name: "Thermal Radiance", confidence: 88.2 }
    ],
    negativeSpace: [],
    aiSummary: "Active structural industrial blaze with dense toxic smoke plume detected. 4 fire tenders mobilized.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [],
    triageScore: 0.88,
    verificationStatus: "COMMUNITY_CONFIRMED",
    confirmVotes: 16,
    disputeVotes: 1,
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString()
  },
  {
    reportId: "rep-mumbai-001",
    disasterType: "Fire",
    userSeverity: "Critical",
    description: "Huge emergency fire spreading through residential apartments! Multiple flames visible, send fire engines urgently!",
    photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: "Bandra West (Rooftop), Mumbai",
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
    aiSummary: "The photo does not show evidence of fire disaster. Detected instead: outdoor grill, barbecue, food. Demonstrates ResQ Dissonance Meter identifying false alerts.",
    clusterId: null,
    clusterCount: 1,
    challengeHistory: [],
    triageScore: 0.17,
    verificationStatus: "AI_ASSESSED",
    confirmVotes: 1,
    disputeVotes: 8,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];
