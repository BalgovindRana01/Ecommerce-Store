// Admin routes for AI-powered features
import { analyzeStockAndBusiness } from '../ai/stockAnalysis.js';

class SimpleRouter {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  }

  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    let path = url.pathname;

    // Remove base path
    if (this.basePath && path.startsWith(this.basePath)) {
      path = path.slice(this.basePath.length);
    }

    for (const route of this.routes) {
      if (route.method === method) {
        // Simple param matching
        const routeParts = route.path.split('/');
        const pathParts = path.split('/');

        if (routeParts.length === pathParts.length) {
          const params = {};
          let match = true;

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            request.params = params;
            return await route.handler(request, env, ctx);
          }
        }
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}

const router = new SimpleRouter('/admin');

// Run AI stock analysis (manual trigger)
router.post('/stock-analysis', async (request, env) => {
  try {
    const result = await analyzeStockAndBusiness(env, false);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      message: 'Stock analysis completed successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Stock analysis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to run stock analysis'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Get daily summaries
router.get('/daily-summaries', async (request, env) => {
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM daily_summaries
      ORDER BY date DESC
      LIMIT 30
    `).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching daily summaries:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch daily summaries'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Get purchase orders
router.get('/purchase-orders', async (request, env) => {
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM purchase_orders
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    // Parse JSON fields
    const parsedResults = results.map(po => ({
      ...po,
      items: JSON.parse(po.items)
    }));

    return new Response(JSON.stringify(parsedResults), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch purchase orders'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Update purchase order status
router.post('/purchase-orders/:id/status', async (request, env) => {
  try {
    const { id } = request.params;
    const { status } = await request.json();

    const validStatuses = ['draft', 'sent', 'received'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({
        error: 'Invalid status'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(`
      UPDATE purchase_orders
      SET status = ?, processed_at = ?
      WHERE id = ?
    `).bind(status, new Date().toISOString(), id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Purchase order status updated'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update purchase order status'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Get flagged orders for review
router.get('/flagged-orders', async (request, env) => {
  try {
    const { results } = await env.DB.prepare(`
      SELECT o.*, u.email, u.name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.fraud_decision = 'flagged'
      ORDER BY o.created_at DESC
      LIMIT 50
    `).all();

    // Parse fraud flags
    const parsedResults = results.map(order => ({
      ...order,
      fraud_flags: JSON.parse(order.fraud_flags || '[]')
    }));

    return new Response(JSON.stringify(parsedResults), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flagged orders:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch flagged orders'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Approve or reject flagged order
router.post('/orders/:id/review', async (request, env) => {
  try {
    const { id } = request.params;
    const { action, adminNote } = await request.json(); // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({
        error: 'Invalid action'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';

    await env.DB.prepare(`
      UPDATE orders
      SET status = ?, fraud_reasoning = fraud_reasoning || ?
      WHERE id = ?
    `).bind(newStatus, `\n\nAdmin Action: ${action} - ${adminNote}`, id).run();

    return new Response(JSON.stringify({
      success: true,
      message: `Order ${action}d successfully`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reviewing order:', error);
    return new Response(JSON.stringify({
      error: 'Failed to review order'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default router;