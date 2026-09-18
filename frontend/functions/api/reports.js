import { evaluateEvidence } from './services/aiEngine.js';
import { applyClustering, calculateTriageScore } from './services/clustering.js';

// Seed demo incidents for Cloudflare edge store
let edgeReports = [
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
    aiSummary: "The photo does not show evidence of wildfire or emergency structural fire. Detected instead: outdoor barbecue, grill, food. This indicates a non-emergency domestic activity or mislabeled report.",
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
  }
];

export async function onRequestGet() {
  const clustered = applyClustering(edgeReports);
  return new Response(JSON.stringify({ reports: clustered, count: clustered.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { disasterType, userSeverity, description, photoUrl, latitude, longitude, locationName } = body;

    // Simulate smart visual detection
    const sampleLabels = disasterType === 'Flood'
      ? [{ name: 'Flood', confidence: 98 }, { name: 'Water', confidence: 95 }]
      : disasterType === 'Fire'
      ? [{ name: 'Smoke', confidence: 94 }, { name: 'Fire', confidence: 91 }]
      : [{ name: 'Asphalt', confidence: 92 }, { name: 'Pothole', confidence: 85 }];

    const assessment = evaluateEvidence({
      disasterType,
      userSeverity,
      labels: sampleLabels
    });

    const triageScore = calculateTriageScore({
      aiSeverity: assessment.aiSeverity,
      corroborationCount: 1,
      dissonanceScore: assessment.dissonanceScore
    });

    const newReport = {
      reportId: `rep-${Date.now()}`,
      disasterType: disasterType || 'Flood',
      userSeverity: userSeverity || 'Medium',
      description: description || '',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60',
      latitude: Number(latitude) || 19.0760,
      longitude: Number(longitude) || 72.8777,
      locationName: locationName || 'Mumbai, Maharashtra',
      ...assessment,
      clusterId: null,
      clusterCount: 1,
      challengeHistory: [],
      triageScore,
      verificationStatus: 'AI_ASSESSED',
      confirmVotes: 0,
      disputeVotes: 0,
      createdAt: new Date().toISOString()
    };

    edgeReports.unshift(newReport);

    return new Response(JSON.stringify({ report: newReport }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
