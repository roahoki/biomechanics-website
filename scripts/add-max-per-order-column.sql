-- Migration: Add max_per_order column to products table
-- This allows configuring a per-order purchase limit per product

ALTER TABLE products
ADD COLUMN IF NOT EXISTS max_per_order INTEGER;

-- Optional: normalize non-positive values to NULL (no limit)
UPDATE products
SET max_per_order = NULL
WHERE max_per_order IS NOT NULL AND max_per_order <= 0;

-- Verify
SELECT id, title, max_per_order FROM products LIMIT 5;
