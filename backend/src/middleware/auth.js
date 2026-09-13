import { verifyJWT } from '../utils/jwt.js';

export async function authMiddleware(request, env, ctx) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    request.user = payload;
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}