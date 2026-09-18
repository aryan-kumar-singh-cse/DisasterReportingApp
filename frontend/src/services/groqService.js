/**
 * ResQ - Groq & Gemini Crisis Intelligence Engine
 * Powered by Groq 120B & Gemini Multi-modal Agents
 */

export async function askCrisisAgent(message, history = [], location = 'Incident Area') {
  if (!message) return null;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, location })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.response) return data;
    }
  } catch (err) {
    console.warn('API chat endpoint unavailable, utilizing internal heuristic agent:', err);
  }

  // Local fallback crisis intelligence
  const query = message.toLowerCase();
  let text = '';
  if (/flood|water|rain|drain/i.test(query)) {
    text = `🌊 **ResQ Flood Evacuation & Safety Advisory (${location})**\n\n1. Move to higher ground or reinforced concrete structures immediately.\n2. Do NOT cross moving waters on foot or vehicle (6 inches of water can sweep you away).\n3. Turn off main circuit breakers.\n4. Call **112** or NDRF **1078** for urgent water extraction.`;
  } else if (/fire|smoke|flame/i.test(query)) {
    text = `🔥 **ResQ Fire & Smoke Advisory (${location})**\n\n1. Evacuate immediately using emergency stairs. Do NOT take elevators.\n2. Crawl low under smoke to preserve breathable oxygen.\n3. Place damp cloth over mouth and nose.\n4. Call Fire Services **101** or **112**.`;
  } else {
    text = `🛡️ **ResQ Crisis Intelligence Directive (${location})**\n\n- Real-time telemetry monitoring is recommended.\n- Verify active claims with the ResQ Dissonance meter and Live Doppler radar.\n- For immediate search and rescue dispatch, dial **112**.`;
  }

  return { response: text, agent: 'ResQ Tactical Agent (Direct)' };
}

export async function generateTacticalBriefing(report) {
  if (!report) return null;

  const prompt = `You are the Senior Emergency Dispatch Commander for ResQ Disaster Intelligence.
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
