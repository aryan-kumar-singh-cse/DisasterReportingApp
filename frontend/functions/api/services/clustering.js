export const SEVERITY_WEIGHTS = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  Critical: 1.0,
  Unknown: 0.2
};

export function calculateTriageScore({ aiSeverity = 'Medium', corroborationCount = 1, dissonanceScore = 0.5 }) {
  const sevWeight = SEVERITY_WEIGHTS[aiSeverity] || 0.5;
  const clusterWeight = Math.min(corroborationCount / 4, 1.0);
  const alignmentWeight = Math.max(0, 1 - dissonanceScore);

  const rawScore = (sevWeight * 0.4) + (clusterWeight * 0.3) + (alignmentWeight * 0.3);
  return Math.round(rawScore * 100) / 100;
}

export function applyClustering(reports = []) {
  const LAT_LNG_THRESHOLD = 0.02; // ~2.2 km
  const TIME_THRESHOLD_MS = 45 * 60 * 1000; // 45 minutes

  return reports.map((report) => {
    const matchingInCluster = reports.filter((other) => {
      if (report.disasterType !== other.disasterType) return false;
      const latDiff = Math.abs(report.latitude - other.latitude);
      const lngDiff = Math.abs(report.longitude - other.longitude);
      const timeDiff = Math.abs(new Date(report.createdAt) - new Date(other.createdAt));
      return latDiff <= LAT_LNG_THRESHOLD && lngDiff <= LAT_LNG_THRESHOLD && timeDiff <= TIME_THRESHOLD_MS;
    });

    const clusterCount = matchingInCluster.length;
    const clusterId = clusterCount >= 3 ? `cluster-${report.disasterType.toLowerCase()}-${report.latitude.toFixed(2)}` : null;

    const triageScore = calculateTriageScore({
      aiSeverity: report.aiSeverity,
      corroborationCount: clusterCount,
      dissonanceScore: report.dissonanceScore || 0.5
    });

    return {
      ...report,
      clusterId,
      clusterCount,
      triageScore
    };
  });
}
