// Simple router for order routes
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

const router = new SimpleRouter('/orders');

import { detectOrderFraud } from '../ai/fraudDetection.js';
import { sendOrderConfirmationEmail } from '../utils/email.js';

// Get user's orders
router.get('/', async (request, env) => {
  const userId = request.user.userId;
  const { results } = await env.DB.prepare(`
    SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
  `).bind(userId).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Place order
router.post('/', async (request, env) => {
  const userId = request.user.userId;
  const { items, shippingAddress } = await request.json();

  // Get user email for fraud detection
  const user = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(userId).first();
  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  // Calculate total
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await env.DB.prepare('SELECT price, stock, name FROM products WHERE id = ?').bind(item.productId).first();
    if (!product || product.stock < item.quantity) {
      return new Response('Insufficient stock or product not found', { status: 400 });
    }
    total += product.price * item.quantity;
    orderItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Create order
  const orderResult = await env.DB.prepare(
    'INSERT INTO orders (user_id, total_amount, shipping_address, fraud_decision) VALUES (?, ?, ?, ?)'
  ).bind(userId, total, shippingAddress, 'pending').run();

  const orderId = orderResult.meta.last_row_id;

  // Add order items and update stock
  for (const item of orderItems) {
    await env.DB.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    ).bind(orderId, item.productId, item.quantity, item.price).run();

    // Update stock
    await env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').bind(item.quantity, item.productId).run();
  }

  // AI Fraud Detection
  const orderData = {
    orderId,
    customerEmail: user.email,
    total,
    shippingAddress,
    items: orderItems
  };

  const fraudResult = await detectOrderFraud(env, orderData, user.email);

  // Update order with fraud detection results
  await env.DB.prepare(`
    UPDATE orders
    SET fraud_decision = ?, fraud_reasoning = ?, fraud_flags = ?
    WHERE id = ?
  `).bind(
    fraudResult.decision,
    fraudResult.reasoning,
    JSON.stringify(fraudResult.flag_reasons),
    orderId
  ).run();

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail(env, orderId, user.email, {
      total,
      shippingAddress,
      items: orderItems
    });
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the order if email fails
  }

  return new Response(JSON.stringify({
    orderId,
    total,
    fraudDecision: fraudResult.decision,
    status: fraudResult.decision === 'flagged' ? 'under_review' : 'confirmed'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Get order by ID
router.get('/:id', async (request, env) => {
  const { id } = request.params;
  const userId = request.user.userId;

  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').bind(id, userId).first();

  if (!order) {
    return new Response('Order not found', { status: 404 });
  }

  const { results: items } = await env.DB.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).bind(id).all();

  return new Response(JSON.stringify({ ...order, items }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

export default router;