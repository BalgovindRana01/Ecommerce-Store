-- Migration: Add all missing columns to orders table

-- Add order tracking columns (without UNIQUE constraint due to SQLite limitations)
ALTER TABLE orders ADD COLUMN order_ref TEXT;
ALTER TABLE orders ADD COLUMN otp_code TEXT;
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;
ALTER TABLE orders ADD COLUMN customer_notes TEXT;
ALTER TABLE orders ADD COLUMN delivery_type TEXT DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card';

-- Add fraud detection columns
ALTER TABLE orders ADD COLUMN fraud_decision TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN fraud_reasoning TEXT;
ALTER TABLE orders ADD COLUMN fraud_flags TEXT;

-- Create index on order_ref for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON orders(order_ref);
