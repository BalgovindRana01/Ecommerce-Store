-- Migration: Add AI-related fields and tables
-- Run this after deploying the updated code

-- Add fraud detection fields to orders table
ALTER TABLE orders ADD COLUMN fraud_decision TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN fraud_reasoning TEXT;
ALTER TABLE orders ADD COLUMN fraud_flags TEXT;

-- Add guest checkout and tracking fields to orders
ALTER TABLE orders ADD COLUMN order_ref TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN otp_code TEXT;
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;
ALTER TABLE orders ADD COLUMN customer_notes TEXT;
ALTER TABLE orders ADD COLUMN delivery_type TEXT DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card';

-- Create purchase_orders table for AI-generated POs
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

-- Create daily_summaries table for AI business insights
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

-- Add indexes for better performance
CREATE INDEX idx_orders_fraud_decision ON orders(fraud_decision);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);