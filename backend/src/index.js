/**
 * TwoTruths - Consolidated AWS Lambda Handler
 */

const { evaluateEvidence } = require('./services/aiService');
const { applyClustering, calculateTriageScore } = require('./utils/clustering');

// In-memory store for local / fallback demo operation
let inMemoryReports = [
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
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '/';

  // Handle preflight OPTIONS
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    // 1. Health Check
    if (method === 'GET' && path === '/health') {
      return jsonResponse(200, {
        status: 'ok',
        service: 'TwoTruths-Consolidated-Lambda',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // 2. GET /reports
    if (method === 'GET' && (path === '/reports' || path === '/')) {
      const clustered = applyClustering(inMemoryReports);
      return jsonResponse(200, { reports: clustered, count: clustered.length });
    }

    // 3. POST /reports/upload-url (S3 Presigned URL)
    if (method === 'POST' && path === '/reports/upload-url') {
      const body = event.body ? JSON.parse(event.body) : {};
      const fileType = body.fileType || 'image/jpeg';
      const key = `reports/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      return jsonResponse(200, {
        uploadUrl: `https://mock-s3-upload.local/${key}`,
        s3Key: key,
        fileUrl: `https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60`
      });
    }

    // 4. POST /reports (Create & Assess)
    if (method === 'POST' && path === '/reports') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { disasterType, userSeverity, description, photoUrl, latitude, longitude, locationName } = body;

      // Simulated Rekognition labels if running offline / without AWS credentials
      const sampleLabels = disasterType === 'Flood'
        ? [{ Name: 'Flood', Confidence: 98 }, { Name: 'Water', Confidence: 95 }]
        : disasterType === 'Fire'
        ? [{ Name: 'Smoke', Confidence: 94 }, { Name: 'Fire', Confidence: 91 }]
        : [{ Name: 'Asphalt', Confidence: 92 }, { Name: 'Pothole', Confidence: 85 }];

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

      inMemoryReports.unshift(newReport);
      return jsonResponse(201, { report: newReport });
    }

    // 5. POST /reports/{id}/vote
    const voteMatch = path.match(/^\/reports\/([^/]+)\/vote$/);
    if (method === 'POST' && voteMatch) {
      const reportId = voteMatch[1];
      const body = event.body ? JSON.parse(event.body) : {};
      const voteType = body.type; // 'confirm' or 'dispute'

      const report = inMemoryReports.find(r => r.reportId === reportId);
      if (!report) return jsonResponse(404, { error: 'Report not found' });

      if (voteType === 'confirm') report.confirmVotes = (report.confirmVotes || 0) + 1;
      if (voteType === 'dispute') report.disputeVotes = (report.disputeVotes || 0) + 1;

      if (report.disputeVotes >= 3 && report.disputeVotes >= report.confirmVotes) {
        report.verificationStatus = 'DISPUTED';
      } else if (report.confirmVotes >= 3 && report.confirmVotes > report.disputeVotes * 2) {
        report.verificationStatus = 'COMMUNITY_CONFIRMED';
      }

      return jsonResponse(200, { report });
    }

    // 6. POST /reports/{id}/challenge
    const challengeMatch = path.match(/^\/reports\/([^/]+)\/challenge$/);
    if (method === 'POST' && challengeMatch) {
      const reportId = challengeMatch[1];
      const body = event.body ? JSON.parse(event.body) : {};
      const { contextNote, counterPhotoUrl } = body;

      const report = inMemoryReports.find(r => r.reportId === reportId);
      if (!report) return jsonResponse(404, { error: 'Report not found' });

      // Append challenge history
      report.challengeHistory = report.challengeHistory || [];
      report.challengeHistory.push({
        timestamp: new Date().toISOString(),
        photoUrl: counterPhotoUrl || report.photoUrl,
        contextNote: contextNote || 'Citizen submitted clarification and corroborating view.',
        aiVerification: report.aiVerification,
        dissonanceScore: report.dissonanceScore,
        aiSummary: report.aiSummary
      });

      // Update to consistent
      report.aiVerification = 'CONSISTENT';
      report.dissonanceScore = 0.15;
      report.aiSummary = `Assessment updated to CONSISTENT following citizen challenge: "${contextNote || 'Corroborating visual angle provided.'}"`;
      report.triageScore = Math.min(1.0, (report.triageScore || 0.4) + 0.35);

      return jsonResponse(200, { report });
    }

    return jsonResponse(404, { error: `Route ${method} ${path} not found` });
  } catch (err) {
    console.error('Lambda execution error:', err);
    return jsonResponse(500, { error: err.message });
  }
};
