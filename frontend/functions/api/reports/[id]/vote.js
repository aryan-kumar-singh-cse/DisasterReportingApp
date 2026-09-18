export async function onRequestPost(context) {
  try {
    const reportId = context.params.id;
    const body = await context.request.json();
    const voteType = body.type; // 'confirm' or 'dispute'

    return new Response(JSON.stringify({
      status: 'ok',
      reportId,
      voteType,
      message: 'Vote recorded on Cloudflare edge'
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
