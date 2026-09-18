/**
 * TwoTruths - Groq Ultra-Fast Tactical Commander Briefing Engine
 * Powered by Groq 120B
 */

export async function generateTacticalBriefing(report) {
  if (!report) return null;

  const prompt = `You are the Senior Emergency Dispatch Commander for TwoTruths Disaster Intelligence.
Generate an immediate tactical incident briefing for this report:
- Disaster: ${report.disasterType}
- Location: ${report.locationName}
- Citizen Claimed Severity: ${report.userSeverity}
- AI Assessed Severity: ${report.aiSeverity}
- Dissonance Score: ${report.dissonanceScore} (${report.dissonanceScore >= 0.7 ? 'Divergent / Contradictory' : report.dissonanceScore >= 0.3 ? 'Partial Alignment' : 'Strongly Aligned'})
- Corroborating Reports: ${report.clusterCount || 1}
- Citizen Note: "${report.description}"
- AI Vision Summary: "${report.aiSummary}"

Provide a concise, military-grade emergency dispatch briefing matching this format:
1. [TACTICAL ACTION]: Directives on exactly what units to dispatch (boats, fire engines, drones, ambulances).
2. [DISSONANCE DIRECTIVE]: How responders should handle the gap between citizen claim and AI evidence.
3. [COMMAND CODE]: Urgent Priority Code (e.g. CODE RED-ALPHA, CODE AMBER-RECON, CODE GREEN-MONITOR).

Keep it under 90 words. Direct, decisive, authoritative.`;

  try {
    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, report })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.briefing) return data.briefing;
    }
  } catch (apiErr) {
    console.warn('API briefing endpoint unavailable, using direct fallback:', apiErr);
  }

  // Fallback tactical intelligence heuristics
  if ((report.dissonanceScore || 0) >= 0.7) {
    return `[TACTICAL ACTION]: Hold primary heavy response units. Dispatch 1 light reconnaissance drone to verify perimeter.\n[DISSONANCE DIRECTIVE]: Severe claim contradicted by visual evidence (Dissonance ${Math.round(report.dissonanceScore * 100)}%). Route to verification queue to prevent asset diversion.\n[COMMAND CODE]: CODE AMBER-RECON (Hold primary apparatus).`;
  }
  return `[TACTICAL ACTION]: Immediate dispatch authorized: 2 specialized rescue units and 1 medical triage team to ${report.locationName}.\n[DISSONANCE DIRECTIVE]: High visual evidence alignment (${Math.round((1 - report.dissonanceScore) * 100)}% corroborated). Proceed with high-urgency intervention.\n[COMMAND CODE]: CODE RED-ALPHA (Immediate Deploy).`;
}
