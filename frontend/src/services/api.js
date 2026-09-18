import { mockReports } from '../data/mockReports';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Local in-memory state for offline/fallback mode
let localReports = [...mockReports];

/**
 * Checks if the remote API Gateway is reachable
 */
export async function checkApiHealth() {
  if (!API_BASE_URL) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all disaster reports
 */
export async function fetchReports() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from API Gateway, using local mock reports:', err);
    }
  }

  // Fallback to local in-memory dataset
  return localReports;
}

/**
 * Request S3 Presigned URL for direct upload
 */
export async function getUploadUrl(contentType = 'image/jpeg') {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to get presigned URL from API Gateway:', err);
    }
  }

  return {
    uploadUrl: null,
    s3Key: `mock-${Date.now()}.jpg`,
    photoUrl: null
  };
}

/**
 * Submit a new disaster report
 */
export async function submitReport(reportData) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to submit report to API Gateway, saving locally:', err);
    }
  }

  // Local fallback — clearly marks report as NOT AI-assessed (backend offline)
  const newReport = {
    reportId: `rep-local-${Date.now()}`,
    disasterType: reportData.disasterType,
    description: reportData.description,
    photoUrl: reportData.photoUrl,
    latitude: reportData.latitude,
    longitude: reportData.longitude,
    locationName: reportData.locationName || 'Citizen GPS Location',
    userSeverity: reportData.userSeverity,
    aiSeverity: 'Unknown',
    aiVerification: 'INCONCLUSIVE',
    aiDetectedLabels: [],
    verificationStatus: 'PENDING',
    confirmVotes: 0,
    disputeVotes: 0,
    createdAt: new Date().toISOString(),
    _offlineMode: true
  };

  localReports = [newReport, ...localReports];
  return newReport;
}

/**
 * Cast a community vote (CONFIRM or DISPUTE)
 */
export async function castVote(reportId, voteType) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to cast vote on API Gateway, updating locally:', err);
    }
  }

  // Update in local memory
  localReports = localReports.map((r) => {
    if (r.reportId === reportId) {
      const confirmVotes = voteType === 'CONFIRM' ? (r.confirmVotes || 0) + 1 : (r.confirmVotes || 0);
      const disputeVotes = voteType === 'DISPUTE' ? (r.disputeVotes || 0) + 1 : (r.disputeVotes || 0);

      let verificationStatus = r.verificationStatus;
      if (confirmVotes >= 3 && confirmVotes > disputeVotes * 2) {
        verificationStatus = 'COMMUNITY_CONFIRMED';
      } else if (disputeVotes >= 3) {
        verificationStatus = 'DISPUTED';
      }

      return {
        ...r,
        confirmVotes,
        disputeVotes,
        verificationStatus
      };
    }
    return r;
  });

  return localReports.find(r => r.reportId === reportId);
}
