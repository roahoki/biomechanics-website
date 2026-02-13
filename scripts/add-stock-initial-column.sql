-- Migration: Add stock_initial column to products table
-- This column tracks the original stock quantity set when creating/restocking a product
-- while stock_value represents the current available stock (decremented on confirmed orders)

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_initial INTEGER;

-- Migrate existing data: copy current stock_value to stock_initial for quantity-based products
UPDATE products
SET stock_initial = CASE 
  WHEN stock_type = 'quantity' AND stock_value IS NOT NULL THEN stock_value::INTEGER
  ELSE NULL
END
WHERE stock_initial IS NULL;

-- Verify the migration
SELECT id, title, stock_type, stock_initial, stock_value FROM products LIMIT 10;
