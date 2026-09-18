import { evaluateEvidence as fallbackRuleEngine } from './aiEngine.js';

export async function assessImageWithGemini({
  apiKey,
  disasterType,
  userSeverity,
  description,
  photoUrl,
  photoBase64
}) {
  const key = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (!key) {
    // Graceful fallback to rule engine if key is not configured in Cloudflare environment
    return fallbackRuleEngine({ disasterType, userSeverity, labels: [] });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${key}`;

  const prompt = `You are the AI Evidence Auditor for TwoTruths, a disaster intelligence platform.
A citizen filed an emergency crowdsourced report.
Claimed Disaster Type: ${disasterType}
Claimed Severity: ${userSeverity}
Citizen Description: "${description || 'None provided'}"

Analyze the visual evidence and return ONLY valid JSON matching this schema:
{
  "aiVerification": "CONSISTENT" | "INCONCLUSIVE" | "INCONSISTENT",
  "dissonanceScore": number (0.0 for complete agreement to 1.0 for contradiction),
  "aiSeverity": "Low" | "Medium" | "High" | "Critical",
  "aiDetectedLabels": [{"name": string, "confidence": number}],
  "negativeSpace": [string (crucial hazard signatures that are explicitly absent)],
  "aiSummary": string (1-2 sentences explaining what was observed vs claimed)
}`;

  try {
    const parts = [{ text: prompt }];

    if (photoBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: photoBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      });
    } else if (photoUrl && photoUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(photoUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          let binary = '';
          const bytes = new Uint8Array(arrayBuffer);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const b64 = btoa(binary);
          const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
          parts.push({ inlineData: { mimeType, data: b64 } });
        }
      } catch (imgErr) {
        console.warn('Could not fetch image bytes for vision, using text fallback:', imgErr);
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) throw new Error('No candidate content received from Gemini');

    const parsed = JSON.parse(rawJson);

    return {
      aiVerification: parsed.aiVerification || 'INCONCLUSIVE',
      dissonanceScore: typeof parsed.dissonanceScore === 'number' ? Math.round(parsed.dissonanceScore * 100) / 100 : 0.5,
      aiSeverity: parsed.aiSeverity || 'Medium',
      aiDetectedLabels: (parsed.aiDetectedLabels || []).map(l => ({
        name: l.name || 'Unknown',
        confidence: typeof l.confidence === 'number' ? (l.confidence <= 1 ? Math.round(l.confidence * 1000) / 10 : Math.round(l.confidence * 10) / 10) : 85.0
      })),
      negativeSpace: parsed.negativeSpace || [],
      aiSummary: parsed.aiSummary || 'AI assessment completed.'
    };
  } catch (err) {
    console.warn('Gemini vision API call failed, falling back to rule engine:', err);
    return fallbackRuleEngine({ disasterType, userSeverity, labels: [] });
  }
}
