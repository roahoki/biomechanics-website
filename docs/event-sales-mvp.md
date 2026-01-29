# MVP Ventas de Entradas y Barra

Este documento describe el esquema de base de datos en Supabase y el flujo operativo para el MVP.

## Tablas (SQL)

```sql
-- products: tickets y barra
create table if not exists products (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null check (type in ('ticket','item')),
  price integer not null,
  visible boolean default true,
  category text,
  isYogaAddOn boolean default false,
  stock integer, -- usar 25 para yoga
  payment_link text
);

-- orders: orden agregada
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  buyer_name text,
  buyer_contact text,
  status text not null default 'created' check (status in ('created','paid','redeemed')),
  payment_method text default 'fintoc_tpp',
  amount integer not null,
  redemption_code uuid not null
);

-- order_items: líneas de la orden
create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id bigint not null references products(id),
  title_snapshot text not null,
  unit_price integer not null,
  quantity integer not null,
  redeemed_qty integer not null default 0
);

-- redemptions: registro de canje (opcional)
create table if not exists redemptions (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  created_at timestamptz default now(),
  notes text
);
```

## RLS (políticas sugeridas)
- `products`: `select` pública (visible=true).
- `orders` y `order_items`: `select` pública por `id` (solo lectura) para mostrar voucher; `insert` y `update` solo server role (service key) usado por endpoints.

## Flujo de compra
1. Usuario selecciona ticket o ítem en `/menu`.
2. Se crea la orden (`/api/orders/create`) y se muestra el voucher `/orders/:id` con QR.
3. Pago Fintoc: se usa `payment_link` por precio (TPP) o manual; retorno opcional al voucher.
4. Staff escanea QR y canjea por ítem/entrada desde `/admin/redemptions/:id`.

## Yoga (cupo limitado)
- `isYogaAddOn=true` y `stock=25`.
- El endpoint de creación valida sumatoria de `quantity` ya comprometida en `order_items` vs `stock`.

## Operación
- Impresión de QR general hacia `/menu` y voucher por compra.
- Inventario de barra se lleva aparte; aquí se controla canje unitario por ítem.
- Fallback: si pago falla, se puede registrar orden y canjear manualmente.

## Admin precios
- `/admin/pricing` permite editar precios, visibilidad, cupo yoga y link Fintoc por SKU.

