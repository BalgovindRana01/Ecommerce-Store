// Simple router for product routes
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

const router = new SimpleRouter('/products');

// Get categories (must come before /:id route)
router.get('/categories', async (request, env) => {
  const { results } = await env.DB.prepare('SELECT * FROM categories').all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Get products by category (must come before /:id route)
router.get('/category/:categoryId', async (request, env) => {
  const { categoryId } = request.params;
  const { results } = await env.DB.prepare('SELECT * FROM products WHERE category_id = ?').bind(categoryId).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Get all products
router.get('/', async (request, env) => {
  const { results } = await env.DB.prepare('SELECT * FROM products').all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Get product by ID (must be last)
router.get('/:id', async (request, env) => {
  const { id } = request.params;
  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(product), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Add new category
router.post('/categories', async (request, env) => {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return new Response(JSON.stringify({ error: 'Category name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      'INSERT INTO categories (name, description) VALUES (?, ?)'
    ).bind(name, description || '').run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: 'Category added successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return new Response(JSON.stringify({ error: 'Failed to add category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Add new product
router.post('/', async (request, env) => {
  try {
    const { name, description, price, category_id, stock, image_url } = await request.json();

    if (!name || !price) {
      return new Response(JSON.stringify({ error: 'Product name and price are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      'INSERT INTO products (name, description, price, category_id, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, description || '', price, category_id || null, stock || 0, image_url || '').run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: 'Product added successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding product:', error);
    return new Response(JSON.stringify({ error: 'Failed to add product' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default router;