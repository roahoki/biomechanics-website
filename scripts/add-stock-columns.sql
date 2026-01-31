-- Migration: Add inventory management columns to products table
-- This migration adds stock_type and stock_value columns for inventory tracking

-- Add stock_type column (quantity or boolean)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_type TEXT DEFAULT 'quantity' CHECK (stock_type IN ('quantity', 'boolean'));

-- Add stock_value column (stores numeric or boolean values)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_value NUMERIC DEFAULT 10;

-- Optional: Set default values for existing products (if they exist)
UPDATE products 
SET stock_type = 'quantity', stock_value = 10 
WHERE stock_type IS NULL;

-- Verify the migration
SELECT id, title, stock_type, stock_value FROM products LIMIT 5;
