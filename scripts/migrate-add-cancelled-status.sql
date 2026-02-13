-- Migración: Agregar estado 'cancelled' al constraint de la tabla orders
-- Fecha: 2026-01-31
-- Propósito: Permitir anular órdenes desde el admin

-- Drop el constraint existente
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Recrear el constraint con el nuevo estado 'cancelled'
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('created', 'paid', 'redeemed', 'cancelled'));

-- Verificar que el constraint se aplicó correctamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass AND conname = 'orders_status_check';
