// Helper function to normalize payment methods for Razorpay
function normalizePaymentMethod(paymentMethod) {
  // Map specific UPI apps to 'upi' for Razorpay
  if (['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay', 'other_upi'].includes(paymentMethod)) {
    return 'upi';
  }
  return paymentMethod;
}

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

    if (this.basePath && path.startsWith(this.basePath)) {
      path = path.slice(this.basePath.length);
    }

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const routeParts = route.path.split('/').filter(Boolean);
      const pathParts = path.split('/').filter(Boolean);

      if (routeParts.length !== pathParts.length) continue;

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

      if (!match) continue;

      request.params = params;
      return await route.handler(request, env, ctx);
    }

    return jsonResponse({ success: false, message: 'Not Found' }, 404);
  }
}

const categoryEmoji = {
  grocery: '🥕',  // carrot for grocery/food items
  dairy: '🥛',    // milk for dairy products
  snacks: '🍪',   // cookie for snacks
  beverages: '🥤', // cup with straw for beverages
  household: '🧹', // broom for household items
  lifestyles: '💅', // nail polish for personal care/lifestyle
  fashion: '👕',   // t-shirt for fashion/clothing
  electronic: '📱', // mobile phone for electronic devices
};

function normalizeCategory(value) {
  if (!value) return 'other';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getEmojiForProduct(productName, category) {
  const name = productName.toLowerCase();

  // Product-specific emojis
  if (name.includes('rice')) return '🍚';
  if (name.includes('milk')) return '🥛';
  if (name.includes('bread')) return '🍞';
  if (name.includes('cheese')) return '🧀';
  if (name.includes('chips') || name.includes('crispy')) return '🍟';
  if (name.includes('tea')) return '🍵';
  if (name.includes('coffee')) return '☕';
  if (name.includes('soap')) return '🧼';
  if (name.includes('shampoo')) return '🧴';
  if (name.includes('deodorant')) return '🧴';
  if (name.includes('cookies') || name.includes('biscuits')) return '🍪';
  if (name.includes('juice')) return '🧃';
  if (name.includes('sugar')) return '🧂';
  if (name.includes('yogurt')) return '🥛';
  if (name.includes('butter')) return '🧈';
  if (name.includes('oil')) return '🫒';
  if (name.includes('detergent')) return '🧺';
  if (name.includes('toothpaste')) return '🧷';
  if (name.includes('perfume')) return '🌸';

  // Electronic product emojis
  if (name.includes('smartphone') || name.includes('phone')) return '📱';
  if (name.includes('laptop') || name.includes('computer')) return '💻';
  if (name.includes('tablet')) return '📱';
  if (name.includes('watch') && category === 'electronic') return '⌚';
  if (name.includes('headphones') || name.includes('earbuds')) return '🎧';
  if (name.includes('speaker')) return '🔊';
  if (name.includes('power bank') || name.includes('charger')) return '🔋';
  if (name.includes('cable') || name.includes('wire')) return '🔌';

  // Fashion product emojis
  if (name.includes('shoes') || name.includes('sneakers')) return '👟';
  if (name.includes('shirt') || name.includes('t-shirt') || name.includes('polo')) return '👕';
  if (name.includes('jeans')) return '👖';
  if (name.includes('socks')) return '🧦';
  if (name.includes('dress')) return '👗';
  if (name.includes('jacket')) return '🧥';
  if (name.includes('shorts')) return '🩳';
  if (name.includes('belt')) return '🪖';
  if (name.includes('cap')) return '🧢';
  if (name.includes('scarf')) return '🧣';
  if (name.includes('sunglasses')) return '🕶️';
  if (name.includes('watch')) return '⌚';

  // Fallback to category emojis
  return categoryEmoji[category] || '🛒';
}

function mapProduct(row) {
  const category = normalizeCategory(row.category_name || row.category || 'other');

  return {
    id: String(row.id),
    name: row.name,
    price: row.price,
    category,
    emoji: getEmojiForProduct(row.name, category),
    description: row.description || '',
    image: row.image_url || '',
    stock: row.stock || 0,
  };
}

function randomOrderRef() {
  return `ORD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function getOrCreateGuestUser(env, customer) {
  if (!customer?.email) {
    throw new Error('Customer email is required');
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(customer.email).first();
  if (existing?.id) {
    return existing.id;
  }

  const result = await env.DB.prepare(
    'INSERT INTO users (email, password_hash, name, address, phone) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(customer.email, 'guest', customer.name || 'Guest', customer.address || '', customer.phone || '')
    .run();

  return result.meta.last_row_id;
}

function getBase64Key(keyId, keySecret) {
  if (typeof btoa === 'function') {
    return btoa(`${keyId}:${keySecret}`);
  }
  return Buffer.from(`${keyId}:${keySecret}`).toString('base64');
}

async function createRazorpayOrder(env, amount, currency = 'INR', receiptId) {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  const body = JSON.stringify({
    amount: Math.round(amount * 100),
    currency,
    receipt: receiptId ? `order_${receiptId}` : undefined,
    payment_capture: 1,
  });

  console.log('createRazorpayOrder request', { amount, currency, receiptId, body });

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getBase64Key(keyId, keySecret)}`,
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Razorpay order creation failed: ${response.status} ${text}`);
  }

  const parsed = JSON.parse(text);
  console.log('createRazorpayOrder response', parsed);
  return parsed;
}

async function verifyRazorpayPayment(env, paymentId, orderId, signature) {
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('Razorpay secret is not configured');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const keyData = encoder.encode(keySecret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return { verified: generatedSignature === signature };
}

function getRazorpayConfig(env) {
  const keyId = env.RAZORPAY_KEY_ID || '';
  return {
    key: keyId,
    name: 'BuyInHome Store',
    description: 'Complete your order securely',
    image: 'https://store1.buyinhome.workers.dev/assets/logo.png',
    theme: {
      color: '#7C3AED',
    },
  };
}

const router = new SimpleRouter('/api');

router.get('/catalog', async (request, env) => {
  const { results } = await env.DB.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `).all();

  const products = results.map(mapProduct);
  return jsonResponse({ success: true, data: products });
});

router.get('/catalog/:id', async (request, env) => {
  const { id } = request.params;
  const product = await env.DB.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `)
    .bind(id)
    .first();

  if (!product) {
    return jsonResponse({ success: false, message: 'Product not found' }, 404);
  }

  const mappedProduct = mapProduct(product);
  const relatedResults = await env.DB.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ? AND p.id != ?
    LIMIT 4
  `)
    .bind(product.category_id, id)
    .all();

  const related = relatedResults.results.map(mapProduct);
  return jsonResponse({ success: true, data: { product: mappedProduct, related } });
});

router.post('/order', async (request, env) => {
  try {
    const body = await request.json();
    const { items, customer, deliveryType, paymentMethod, total } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return jsonResponse({ success: false, message: 'Cart items are required' }, 400);
    }

    if (!customer?.email || !customer?.name || !customer?.phone) {
      return jsonResponse({ success: false, message: 'Customer name, email, and phone are required' }, 400);
    }
    if (deliveryType === 'delivery' && !customer?.address) {
      return jsonResponse({ success: false, message: 'Delivery address is required for delivery orders' }, 400);
    }

    const normalizedItems = items.map((item) => {
      const productId = item.product?.id || item.productId || item.id;
      const quantity = Number(item.quantity || item.qty || 1);
      return { productId, quantity };
    });

    const itemIds = normalizedItems.map((item) => item.productId);
    const placeholders = itemIds.map(() => '?').join(',');
    const query = `SELECT * FROM products WHERE id IN (${placeholders})`;
    const { results: productRows } = await env.DB.prepare(query).bind(...itemIds).all();

    const orderItems = normalizedItems.map((item) => {
      const productRow = productRows.find((row) => String(row.id) === String(item.productId));
      if (!productRow) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (productRow.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${productRow.name}`);
      }
      return {
        ...item,
        name: productRow.name,
        price: productRow.price,
      };
    });

    let calculatedTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = deliveryType === 'pickup' ? 0 : (calculatedTotal < 100 ? 20 : 0);
    calculatedTotal += deliveryCharge;

    const userId = await getOrCreateGuestUser(env, customer);
    const orderRef = randomOrderRef();
    const initialStatus = paymentMethod === 'cod' ? 'accepted' : 'pending';
    const otpCode = paymentMethod === 'cod' ? null : randomOtp();
    const shippingAddress = deliveryType === 'pickup' ? 'Pickup at store' : customer.address;

    const orderInsert = await env.DB.prepare(
      `INSERT INTO orders
      (user_id, order_ref, otp_code, customer_name, customer_email, customer_phone, customer_notes,
       total_amount, delivery_type, payment_method, status, shipping_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        userId,
        orderRef,
        otpCode,
        customer.name,
        customer.email,
        customer.phone,
        customer.notes || '',
        calculatedTotal,
        deliveryType || 'delivery',
        paymentMethod || 'card',
        initialStatus,
        shippingAddress
      )
      .run();

    const orderId = orderInsert.meta.last_row_id;

    for (const item of orderItems) {
      await env.DB.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      )
        .bind(orderId, item.productId, item.quantity, item.price)
        .run();

      await env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
        .bind(item.quantity, item.productId)
        .run();
    }

    try {
      await sendOrderConfirmationEmail(env, orderId, customer.email, {
        total: calculatedTotal,
        shippingAddress,
        items: orderItems,
      });
    } catch (error) {
      console.error('Order confirmation email failed:', error);
    }

    // Send OTP via SMS (with email fallback)
    // Send OTP only for non-COD orders
    if (paymentMethod !== 'cod') {
      try {
        await sendOTPSMS(env, customer.phone, otpCode, orderRef);
        console.log('OTP sent via SMS to', customer.phone);
      } catch (smsError) {
        console.error('SMS failed, trying email:', smsError);
        try {
          await sendOTPEmail(env, customer.email, otpCode, orderRef);
          console.log('OTP sent via email to', customer.email);
        } catch (emailError) {
          console.error('Email fallback also failed:', emailError);
          // Continue anyway - OTP is stored in database
        }
      }
    }

    console.log('Order created', orderRef, 'OTP', otpCode);

    // In demo mode, return OTP for testing
    const accountSid = env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid_here';
    const isDemo = !accountSid || accountSid === 'your_twilio_account_sid_here';

    return jsonResponse({
      success: true,
      data: {
        orderRef,
        ...(isDemo && paymentMethod !== 'cod' && { otp: otpCode }) // Include OTP in demo mode for non-COD
      }
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return jsonResponse({ success: false, message: error.message || 'Failed to create order' }, 400);
  }
});

router.post('/order/verify', async (request, env) => {
  try {
    const { orderRef, otp } = await request.json();
    const order = await env.DB.prepare('SELECT id, otp_code, status FROM orders WHERE order_ref = ?')
      .bind(orderRef)
      .first();

    if (!order) {
      return jsonResponse({ success: false, message: 'Order not found' }, 404);
    }

    if (order.otp_code !== otp) {
      return jsonResponse({ success: false, message: 'Invalid OTP' }, 400);
    }

    if (order.status === 'accepted' || order.status === 'paid') {
      return jsonResponse({ success: true, data: null });
    }

    await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind('accepted', order.id).run();
    return jsonResponse({ success: true, data: null });
  } catch (error) {
    console.error('OTP verification failed:', error);
    return jsonResponse({ success: false, message: 'OTP verification failed' }, 500);
  }
});

router.post('/order/resend-otp', async (request, env) => {
  try {
    const { orderRef } = await request.json();
    const order = await env.DB.prepare('SELECT id, customer_email, customer_phone FROM orders WHERE order_ref = ?')
      .bind(orderRef)
      .first();

    if (!order) {
      return jsonResponse({ success: false, message: 'Order not found' }, 404);
    }

    const otpCode = randomOtp();
    await env.DB.prepare('UPDATE orders SET otp_code = ? WHERE id = ?').bind(otpCode, order.id).run();

    // Send new OTP via SMS (with email fallback)
    try {
      await sendOTPSMS(env, order.customer_phone, otpCode, orderRef);
      console.log('OTP resent via SMS to', order.customer_phone);
    } catch (smsError) {
      console.error('SMS failed, trying email fallback:', smsError);
      try {
        await sendOTPEmail(env, order.customer_email, otpCode, orderRef);
        console.log('OTP resent via email to', order.customer_email);
      } catch (emailError) {
        console.error('Email fallback also failed:', emailError);
        return jsonResponse({ success: false, message: 'Failed to send OTP' }, 500);
      }
    }

    console.log('Resent OTP for', orderRef, 'OTP', otpCode);
    return jsonResponse({ success: true, data: null });
  } catch (error) {
    console.error('Resend OTP failed:', error);
    return jsonResponse({ success: false, message: 'Resend OTP failed' }, 500);
  }
});

router.post('/order/payment-method', async (request, env) => {
  try {
    const { orderRef, paymentMethod } = await request.json();
    console.log('Payment method update request:', { orderRef, paymentMethod });

    const order = await env.DB.prepare('SELECT id, status FROM orders WHERE order_ref = ?')
      .bind(orderRef)
      .first();

    console.log('Order found:', order);

    if (!order) {
      console.log('Order not found for ref:', orderRef);
      return jsonResponse({ success: false, message: 'Order not found' }, 404);
    }

    if (order.status !== 'accepted') {
      console.log('Order status not accepted:', order.status);
      return jsonResponse({ success: false, message: 'Order must be verified before updating payment method' }, 400);
    }

    // For COD orders, mark as paid immediately
    const newStatus = paymentMethod === 'cod' ? 'paid' : 'accepted';

    const result = await env.DB.prepare('UPDATE orders SET payment_method = ?, status = ? WHERE id = ?')
      .bind(paymentMethod, newStatus, order.id)
      .run();

    console.log('Update result:', result);

    return jsonResponse({ success: true, message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Payment method update failed:', error);
    return jsonResponse({ success: false, message: 'Failed to update payment method' }, 500);
  }
});

// Create payment order for Razorpay
router.post('/payment/create-order', async (request, env) => {
  try {
    const { orderRef } = await request.json();

    const order = await env.DB.prepare(`
      SELECT o.id, o.total_amount, o.status, o.customer_name, o.customer_email, o.payment_method
      FROM orders o
      WHERE o.order_ref = ?
    `).bind(orderRef).first();

    if (!order) {
      return jsonResponse({ success: false, message: 'Order not found' }, 404);
    }

    if (order.payment_method === 'cod') {
      return jsonResponse({ success: false, message: 'COD orders do not require payment' }, 400);
    }

    console.log('Creating Razorpay order for', { orderRef, amount: order.total_amount, paymentMethod: order.payment_method });
    const razorpayOrder = await createRazorpayOrder(env, order.total_amount, 'INR', order.id);
    console.log('Created Razorpay order', razorpayOrder);

    return jsonResponse({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: getRazorpayConfig(env).key,
        customer: {
          name: order.customer_name,
          email: order.customer_email
        },
        demo: razorpayOrder.demo || false
      }
    });

  } catch (error) {
    console.error('Payment order creation failed:', error);
    return jsonResponse({
      success: false,
      message: error?.message || 'Failed to create payment order',
      error: String(error)
    }, 500);
  }
});

// Verify payment
router.post('/payment/verify', async (request, env) => {
  try {
    const { orderRef, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    const order = await env.DB.prepare('SELECT id FROM orders WHERE order_ref = ?').bind(orderRef).first();
    if (!order) {
      return jsonResponse({ success: false, message: 'Order not found' }, 404);
    }

    // Verify payment signature
    const verification = await verifyRazorpayPayment(env, razorpayPaymentId, razorpayOrderId, razorpaySignature);

    if (!verification.verified) {
      return jsonResponse({ success: false, message: 'Payment verification failed' }, 400);
    }

    // Update order status to paid
    await env.DB.prepare('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?')
      .bind('paid', razorpayPaymentId, order.id).run();

    return jsonResponse({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('Payment verification failed:', error);
    return jsonResponse({ success: false, message: 'Payment verification failed' }, 500);
  }
});

// Get payment configuration
router.get('/payment/config', async (request, env) => {
  return jsonResponse({
    success: true,
    data: getRazorpayConfig(env)
  });
});

router.get('/track/:orderRef', async (request, env) => {
  const { orderRef } = request.params;
  const order = await env.DB.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.order_ref = ?
  `)
    .bind(orderRef)
    .first();

  if (!order) {
    return jsonResponse({ success: false, message: 'Order not found' }, 404);
  }

  const { results: items } = await env.DB.prepare(`
    SELECT oi.*, p.name as product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `)
    .bind(order.id)
    .all();

  const responseOrder = {
    id: String(order.id),
    orderRef: order.order_ref,
    paymentMethod: order.payment_method || 'card',
    status: order.status,
    total: order.total_amount,
    deliveryType: order.delivery_type || 'delivery',
    createdAt: order.created_at,
    customer: {
      name: order.customer_name || order.user_name || 'Guest',
      email: order.customer_email || order.user_email || '',
      phone: order.customer_phone || order.user_phone || '',
      address: order.shipping_address || '',
      notes: order.customer_notes || '',
    },
    items: items.map((item) => ({
      product: {
        id: String(item.product_id),
        name: item.product_name,
        price: item.price,
      },
      quantity: item.quantity,
    })),
  };

  return jsonResponse({ success: true, data: responseOrder });
});

export default router;
