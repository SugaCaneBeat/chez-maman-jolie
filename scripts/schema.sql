-- =============================================
-- Chez Maman Jolie — Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'formules', 'boissons')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  image TEXT,
  accompagnement TEXT,
  badge TEXT,
  available BOOLEAN DEFAULT TRUE,
  boisson_subcategory_id UUID,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Boisson subcategories (for nested drink menu)
CREATE TABLE boisson_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  display_order INT NOT NULL DEFAULT 0
);

-- Add FK after boisson_subcategories exists
ALTER TABLE menu_items
  ADD CONSTRAINT fk_boisson_subcategory
  FOREIGN KEY (boisson_subcategory_id)
  REFERENCES boisson_subcategories(id) ON DELETE CASCADE;

-- Formule conditions
CREATE TABLE formule_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE UNIQUE NOT NULL,
  conditions TEXT NOT NULL
);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number SERIAL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','delivering','delivered','cancelled')),
  total NUMERIC(8,2) NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  image TEXT
);

-- =============================================
-- Updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Migration helper (appele via supabase.rpc)
-- =============================================

CREATE OR REPLACE FUNCTION run_migration(sql TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- =============================================
-- Row Level Security
-- =============================================

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin all categories" ON categories FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);

-- Menu items: public read
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin all menu_items" ON menu_items FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);

-- Boisson subcategories: public read
ALTER TABLE boisson_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read boisson_subcategories" ON boisson_subcategories FOR SELECT USING (true);
CREATE POLICY "Admin all boisson_subcategories" ON boisson_subcategories FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);

-- Formule conditions: public read
ALTER TABLE formule_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read formule_conditions" ON formule_conditions FOR SELECT USING (true);
CREATE POLICY "Admin all formule_conditions" ON formule_conditions FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);

-- Orders: public insert, admin all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);

-- Order items: public insert, admin all
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all order_items" ON order_items FOR ALL USING (
  (SELECT COALESCE((auth.jwt()->'user_metadata'->>'role'), '') = 'admin')
);
