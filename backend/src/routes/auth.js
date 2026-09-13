// Simple router for auth routes
import { createJWT } from '../utils/jwt.js';

class SimpleRouter {
  constructor() {
    this.routes = [];
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  }

  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    for (const route of this.routes) {
      if (route.method === method && route.path === url.pathname) {
        return await route.handler(request, env, ctx);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}

const router = new SimpleRouter();

// Register
router.post('/auth/register', async (request, env) => {
  const { email, password, name, address, phone } = await request.json();

  // Hash password (simple for demo, use bcrypt in production)
  const passwordHash = await hashPassword(password);

  try {
    const result = await env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, address, phone) VALUES (?, ?, ?, ?, ?)'
    ).bind(email, passwordHash, name, address, phone).run();

    const token = await createJWT({ userId: result.meta.last_row_id, email }, env.JWT_SECRET);

    return new Response(JSON.stringify({ token, user: { id: result.meta.last_row_id, email, name } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('User already exists or invalid data', { status: 400 });
  }
});

// Login
router.post('/auth/login', async (request, env) => {
  const { email, password } = await request.json();

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return new Response('Invalid credentials', { status: 401 });
  }

  const token = await createJWT({ userId: user.id, email: user.email }, env.JWT_SECRET);

  return new Response(JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function hashPassword(password) {
  // Simple hash for demo
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

export default router;