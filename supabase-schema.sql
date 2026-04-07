-- schema.sql
-- This schema represents the Angular models for Alitas Company.
-- You can run this file directly in the Supabase SQL Editor.

-- 1. Categories Table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- 2. Venues (Sedes) Table
CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  google_maps_url TEXT,
  schedule_opening TIME,
  schedule_closing TIME,
  schedule_active_days TEXT[],
  active BOOLEAN DEFAULT TRUE,
  image_url TEXT
);

-- 3. Products Table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  allergens TEXT[],
  customizations TEXT[]
);

-- 4. Combos Table
CREATE TABLE combos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  venue_ids TEXT[], -- Array of venue IDs or ['ALL']
  active BOOLEAN DEFAULT TRUE,
  show_savings BOOLEAN DEFAULT TRUE
);

-- 5. Combo_Products (Many-to-Many relationship for Combo includedProducts)
CREATE TABLE combo_products (
  combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY (combo_id, product_id)
);

-- 6. Promotions Table
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC,
  special_price NUMERIC,
  image_url TEXT,
  venue_ids TEXT[], -- Array of venue IDs or ['ALL']
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  applicable_days TEXT[],
  active BOOLEAN DEFAULT TRUE
);

-- 7. Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'superadmin')),
  active BOOLEAN DEFAULT TRUE
);

-- 8. Venue Menus Table
CREATE TABLE venue_menus (
  id TEXT PRIMARY KEY,
  venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_ids TEXT[], -- Array of product IDs enabled for this venue
  combo_ids TEXT[], -- Array of combo IDs enabled for this venue
  is_shared BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

-- Optional RLS (Row Level Security) Templates
-- Uncomment and adapt if you want to secure these tables from public API access

/*
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
*/
