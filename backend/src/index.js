// Simple manual router for Cloudflare Workers
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import apiRoutes from './routes/api.js';
import { analyzeStockAndBusiness } from './ai/stockAnalysis.js';

class SimpleRouter {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  }

  all(path, ...handlers) {
    this.routes.push({ method: 'ALL', path, handler: handlers });
  }

  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Check exact matches first
    for (const route of this.routes) {
      if (route.method === method || route.method === 'ALL') {
        if (route.path === url.pathname) {
            if (Array.isArray(route.handler)) {
              // Middleware chain
              for (const handler of route.handler) {
                if (typeof handler === 'function') {
                  const result = await handler(request, env, ctx);
                  if (result instanceof Response) {
                    return result;
                  }
                } else if (handler.handle) {
                  // Sub-router
                  const result = await handler.handle(request, env, ctx);
                  if (result instanceof Response) {
                    return result;
                  }
                }
              }
            } else {
              if (typeof route.handler === 'function') {
                const result = await route.handler(request, env, ctx);
                if (result instanceof Response) {
                  return result;
                }
              } else if (route.handler.handle) {
                const result = await route.handler.handle(request, env, ctx);
                if (result instanceof Response) {
                  return result;
                }
              }
            }
        }
        // Check wildcard matches
        else if (route.path.endsWith('/*')) {
          const basePath = route.path.slice(0, -2);
          if (url.pathname.startsWith(basePath + '/')) {
            if (Array.isArray(route.handler)) {
              for (const handler of route.handler) {
                if (typeof handler === 'function') {
                  const result = await handler(request, env, ctx);
                  if (result instanceof Response) {
                    return result;
                  }
                } else if (handler.handle) {
                  const result = await handler.handle(request, env, ctx);
                  if (result instanceof Response) {
                    return result;
                  }
                }
              }
            } else {
              if (typeof route.handler === 'function') {
                const result = await route.handler(request, env, ctx);
                if (result instanceof Response) {
                  return result;
                }
              } else if (route.handler.handle) {
                const result = await route.handler.handle(request, env, ctx);
                if (result instanceof Response) {
                  return result;
                }
              }
            }
          }
        }
      }
    }

    // 404
    return new Response('Not Found', { status: 404 });
  }
}

const router = new SimpleRouter();

// Auth routes (no auth required)
router.all('/auth', rateLimitMiddleware, authRoutes);
router.all('/auth/*', rateLimitMiddleware, authRoutes);

// Frontend-compatible API routes
router.all('/api', rateLimitMiddleware, apiRoutes);
router.all('/api/*', rateLimitMiddleware, apiRoutes);

// Public product routes
router.all('/products', rateLimitMiddleware, productRoutes);
router.all('/products/*', rateLimitMiddleware, productRoutes);

// Protected routes
router.all('/orders', rateLimitMiddleware, authMiddleware, orderRoutes);
router.all('/orders/*', rateLimitMiddleware, authMiddleware, orderRoutes);

// Admin routes (protected)
router.all('/admin', rateLimitMiddleware, authMiddleware, adminRoutes);
router.all('/admin/*', rateLimitMiddleware, authMiddleware, adminRoutes);

// Health check
router.get('/', () => new Response('Ecommerce API is running'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function attachCorsHeaders(response) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const response = await router.handle(request, env, ctx);
    return attachCorsHeaders(response);
  },

  // Cron trigger for daily stock analysis
  async scheduled(event, env, ctx) {
    console.log('Running daily cron job for stock analysis');

    try {
      await analyzeStockAndBusiness(env, true);
      console.log('Daily stock analysis completed successfully');
    } catch (error) {
      console.error('Daily stock analysis failed:', error);
    }
  }
};