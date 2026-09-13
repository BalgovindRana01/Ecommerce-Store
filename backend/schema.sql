-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_ref TEXT UNIQUE,
    otp_code TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_notes TEXT,
    total_amount REAL NOT NULL,
    delivery_type TEXT DEFAULT 'delivery',
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    fraud_decision TEXT DEFAULT 'pending', -- approved, flagged, pending
    fraud_reasoning TEXT, -- AI reasoning in Hindi
    fraud_flags TEXT, -- JSON array of flag reasons
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Purchase orders table (for auto-generated POs)
CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_name TEXT NOT NULL,
    supplier_email TEXT,
    supplier_phone TEXT,
    items TEXT NOT NULL, -- JSON array of {product_id, product_name, quantity, urgency}
    total_items INTEGER NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, sent, received
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
);

-- Daily summaries table (AI-generated business insights)
CREATE TABLE daily_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    top_products TEXT, -- JSON array of best-selling products
    low_stock_alerts TEXT, -- JSON array of alerts with urgency
    business_summary TEXT, -- AI-generated summary in Hindi
    insights TEXT, -- Additional AI insights
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);