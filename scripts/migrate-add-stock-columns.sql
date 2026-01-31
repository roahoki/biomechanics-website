-- Migración: Agregar columnas de stock a la tabla products
-- Fecha: 2026-01-31
-- Propósito: Agregar gestión de inventario con stock_type y stock_value

-- Agregar columna stock_type ('quantity' o 'boolean')
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_type TEXT DEFAULT 'quantity';

-- Agregar columna stock_value (puede ser número o booleano)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_value NUMERIC DEFAULT 10;

-- Crear constraint para stock_type
ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS stock_type_check 
  CHECK (stock_type IN ('quantity', 'boolean', NULL));

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('stock_type', 'stock_value')
ORDER BY ordinal_position;
