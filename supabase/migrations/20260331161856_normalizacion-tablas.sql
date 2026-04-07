

-- 1. Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Venues
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  google_maps_url TEXT,
  schedule_opening TIME,
  schedule_closing TIME,
  schedule_active_days TEXT[],
  active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

-- 🔥 NEW: Allergens
CREATE TABLE allergens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 🔥 RELATION: product_allergens
CREATE TABLE product_allergens (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  allergen_id uuid REFERENCES allergens(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, allergen_id)
);

-- 🔥 NEW: Customizations
CREATE TABLE customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  extra_price NUMERIC(10,2) DEFAULT 0
);

-- 🔥 RELATION: product_customizations
CREATE TABLE product_customizations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customization_id uuid REFERENCES customizations(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, customization_id)
);

-- 4. Combos
CREATE TABLE combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  show_savings BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 🔥 RELATION: combos ↔ venues
CREATE TABLE combo_venues (
  combo_id uuid REFERENCES combos(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  PRIMARY KEY (combo_id, venue_id)
);

-- 5. Combo Products
CREATE TABLE combo_products (
  combo_id uuid REFERENCES combos(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY (combo_id, product_id)
);

-- 6. Promotions
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5,2),
  special_price NUMERIC(10,2),
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  applicable_days TEXT[],
  active BOOLEAN DEFAULT TRUE
);

-- 🔥 RELATION: promotions ↔ venues
CREATE TABLE promotion_venues (
  promotion_id uuid REFERENCES promotions(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, venue_id)
);

-- 7. Users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'superadmin')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. Venue Menus
CREATE TABLE venue_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

-- 🔥 RELATIONS: menus
CREATE TABLE venue_menu_products (
  menu_id uuid REFERENCES venue_menus(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, product_id)
);

CREATE TABLE venue_menu_combos (
  menu_id uuid REFERENCES venue_menus(id) ON DELETE CASCADE,
  combo_id uuid REFERENCES combos(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, combo_id)
);


-- Tabla para los Grupos (Ej: "Elige tu Base")
CREATE TABLE product_modifier_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_selection INTEGER DEFAULT 0,
  max_selection INTEGER DEFAULT 1
);

-- Tabla para las Opciones dentro de un Grupo (Ej: "En agua", "En leche")
CREATE TABLE product_modifier_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES product_modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  extra_price NUMERIC(10,2) DEFAULT 0
);