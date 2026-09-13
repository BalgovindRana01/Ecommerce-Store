export async function rateLimitMiddleware(request, env, ctx) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  const data = await env.KV.get(key);
  let requests = data ? JSON.parse(data) : { count: 0, resetTime: now + windowMs };

  if (now > requests.resetTime) {
    requests = { count: 1, resetTime: now + windowMs };
  } else {
    requests.count++;
  }

  if (requests.count > maxRequests) {
    return new Response('Too many requests', { status: 429 });
  }

  await env.KV.put(key, JSON.stringify(requests), { expirationTtl: Math.ceil(windowMs / 1000) });

  // Don't return anything to continue to next handler
  // Headers will be added by the response handler if needed
}