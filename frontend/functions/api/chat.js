/**
 * Cloudflare Pages Function: POST /api/chat
 * Conversational Crisis & Disaster Intelligence Agent
 * Powered by Groq 120B / Gemini with ResQ Emergency Directives
 */

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { message, history = [], location = 'Incident Area' } = body;

    const apiKey = context.env?.GROQ_API_KEY || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '');
    const geminiKey = context.env?.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

    const systemPrompt = `You are "ResQ AI", an emergency crisis intelligence assistant.
Your goal is to provide rapid, actionable, authoritative life-safety directives, disaster guidance, weather risks, and triage advice for citizens and first responders in crisis situations.
Location context: ${location}.
Always prioritize:
1. Human life preservation, evacuation routes, and immediate danger warnings.
2. Official disaster guidelines (NDMA, IMD, USGS, WHO).
3. Clear bullet points, bold directives, and emergency phone numbers (e.g. 112, 108, 101, 1070 for India, or 911 globally).
Keep responses clear, calm, and structured with Markdown headers and bullet points.`;

    if (apiKey) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-4).map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages,
          temperature: 0.3,
          max_tokens: 380
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return new Response(JSON.stringify({ response: reply, agent: 'Groq 120B Tactical Agent' }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
    }

    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: ${message}` }
                ]
              }
            ],
            generationConfig: { maxOutputTokens: 380, temperature: 0.3 }
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return new Response(JSON.stringify({ response: reply, agent: 'Gemini Multimodal Agent' }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
    }

    // High-intelligence domain expert fallback
    const fallbackResponse = generateDomainCrisisReply(message, location);
    return new Response(JSON.stringify({ response: fallbackResponse, agent: 'ResQ Tactical Expert Engine' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      response: "🚨 **ResQ Emergency Guidance**\n- If in immediate peril, dial national emergency **112** or disaster control **1070** immediately.\n- Move to higher ground in floods, stay away from structural hazards in fires.\n- Follow official directives from NDMA and civil defence authorities.",
      agent: 'ResQ Fail-Safe'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function generateDomainCrisisReply(msg, location) {
  const query = (msg || '').toLowerCase();

  if (/flood|water|submerge|drain|rain/i.test(query)) {
    return `🌊 **ResQ Flood Survival Directives for ${location}**

1. **Immediate Safety Action:**
   - Move immediately to upper floors or designated elevated concrete shelters.
   - Do NOT attempt to walk, swim, or drive through flowing water. Just 15 cm (6 inches) of moving water can knock you down.
2. **Electrical & Structural Hazards:**
   - Switch off primary electricity and gas mains before water reaches outlets.
   - Stay clear of downed electrical wires and sub-surface drainage openings.
3. **Emergency Helplines:**
   - National Emergency: **112** | Disaster Management (NDRF): **1078** | Ambulance: **108**`;
  }

  if (/fire|smoke|burn|flame|blaze/i.test(query)) {
    return `🔥 **ResQ Fire & Smoke Hazard Protocol for ${location}**

1. **Immediate Evacuation:**
   - Evacuate downwards via fire staircases immediately; NEVER use elevators.
   - Stay low to the floor where air is cooler and oxygen levels are highest ("Crawl Under Smoke").
2. **Breathing Protection:**
   - Cover your nose and mouth with a wet cloth to filter toxic particulate inhalation.
3. **Containment & Dispatch:**
   - Close doors behind you to starve the flames of oxygen.
   - Fire Services: **101** | National Emergency: **112**.`;
  }

  if (/earthquake|tremor|quake|collapse/i.test(query)) {
    return `⚠️ **ResQ Earthquake Protocol for ${location}**

1. **DROP, COVER, AND HOLD ON:**
   - Drop under heavy wooden furniture (desks, tables) and hold on firmly until shaking stops.
   - Stay away from exterior glass windows, mirrors, brick chimneys, and high furniture.
2. **If Outdoors:**
   - Move to an open clearing away from utility wires, high-voltage lines, and tall facade structures.
3. **Post-Quake:**
   - Expect aftershocks. Check for gas leaks before using any matches or electronics.`;
  }

  return `🛡️ **ResQ Crisis Intelligence Directive for ${location}**

- **Status Assessment:** Active telemetry indicates monitoring is essential. Check the ResQ live Doppler Radar and Lightning tracker for convective hazards.
- **Verification Rule:** Treat unverified social claims with caution; corroborate through the ResQ platform's verified evidence chain.
- **Emergency Priority:** If lives are at immediate risk, contact **112** or local civil defense immediately.`;
}
