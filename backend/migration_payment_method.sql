-- Migration: Add payment_method column to orders table
-- This only adds the payment_method column if it doesn't exist

ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card';
