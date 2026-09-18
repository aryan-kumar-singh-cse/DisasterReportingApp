/**
 * Cloudflare Pages Function: POST /api/briefing
 * Powered by Groq 120B
 */

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { prompt, report } = body;

    const apiKey = context.env?.GROQ_API_KEY || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '');

    if (!apiKey) {
      // Return structured fallback directive if key not yet bound
      const fallback = (report?.dissonanceScore || 0) >= 0.7
        ? "[TACTICAL ACTION]: Hold primary heavy response units. Dispatch 1 light reconnaissance drone to verify perimeter.\n[DISSONANCE DIRECTIVE]: Severe claim contradicted by visual evidence (Dissonance " + Math.round((report?.dissonanceScore || 0) * 100) + "%). Route to verification queue to prevent asset diversion.\n[COMMAND CODE]: CODE AMBER-RECON (Hold primary apparatus)."
        : "[TACTICAL ACTION]: Immediate dispatch authorized: 2 specialized rescue units and 1 medical triage team to " + (report?.locationName || "target zone") + ".\n[DISSONANCE DIRECTIVE]: High visual evidence alignment (" + Math.round((1 - (report?.dissonanceScore || 0)) * 100) + "% corroborated). Proceed with high-urgency intervention.\n[COMMAND CODE]: CODE RED-ALPHA (Immediate Deploy).";
      
      return new Response(JSON.stringify({ briefing: fallback }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are an elite emergency incident commander AI specializing in disaster tactical response.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 220
      })
    });

    if (!res.ok) {
      throw new Error(`Groq returned ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || 'Briefing generated.';

    return new Response(JSON.stringify({ briefing: text }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      briefing: "[TACTICAL ACTION]: Proceed with standard emergency protocol.\n[COMMAND CODE]: CODE YELLOW-CAUTION."
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
