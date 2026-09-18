export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'TwoTruths Cloudflare Edge API',
    runtime: 'Cloudflare Pages Functions',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
