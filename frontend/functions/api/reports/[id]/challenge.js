export async function onRequestPost(context) {
  try {
    const reportId = context.params.id;
    const body = await context.request.json();
    const { contextNote, counterPhotoUrl } = body;

    return new Response(JSON.stringify({
      status: 'ok',
      reportId,
      challenge: {
        timestamp: new Date().toISOString(),
        contextNote: contextNote || 'Clarification submitted',
        aiVerification: 'CONSISTENT',
        dissonanceScore: 0.15
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
