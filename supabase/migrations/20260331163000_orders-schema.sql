-- 1. Orders Table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PREPARANDO', 'ENVIADO', 'COMPLETADO', 'CANCELADO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Order Items Table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  options_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security) - Basic for now
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies (Allow all for now, typical for this stage of dev)
CREATE POLICY "Allow everything for orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow everything for order_items" ON order_items FOR ALL USING (true);
