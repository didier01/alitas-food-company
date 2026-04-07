-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.allergens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT allergens_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.combo_allergens (
  combo_id uuid NOT NULL,
  allergen_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT combo_allergens_pkey PRIMARY KEY (combo_id, allergen_id),
  CONSTRAINT combo_allergens_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id),
  CONSTRAINT combo_allergens_allergen_id_fkey FOREIGN KEY (allergen_id) REFERENCES public.allergens(id)
);
CREATE TABLE public.combo_products (
  combo_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  CONSTRAINT combo_products_pkey PRIMARY KEY (combo_id, product_id),
  CONSTRAINT combo_products_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id),
  CONSTRAINT combo_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.combo_venues (
  combo_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  CONSTRAINT combo_venues_pkey PRIMARY KEY (combo_id, venue_id),
  CONSTRAINT combo_venues_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id),
  CONSTRAINT combo_venues_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.combos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  active boolean DEFAULT true,
  show_savings boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  modifier_groups jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT combos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ingredients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  available boolean DEFAULT true,
  CONSTRAINT ingredients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  product_id uuid,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  options_json jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid,
  customer_name text NOT NULL,
  customer_phone text,
  delivery_address text,
  total_amount numeric NOT NULL,
  status text DEFAULT 'PENDIENTE'::text CHECK (status = ANY (ARRAY['PENDIENTE'::text, 'PREPARANDO'::text, 'ENVIADO'::text, 'COMPLETADO'::text, 'CANCELADO'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.product_allergens (
  product_id uuid NOT NULL,
  allergen_id uuid NOT NULL,
  CONSTRAINT product_allergens_pkey PRIMARY KEY (product_id, allergen_id),
  CONSTRAINT product_allergens_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_allergens_allergen_id_fkey FOREIGN KEY (allergen_id) REFERENCES public.allergens(id)
);
CREATE TABLE public.product_ingredients (
  product_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric DEFAULT 1,
  CONSTRAINT product_ingredients_pkey PRIMARY KEY (product_id, ingredient_id),
  CONSTRAINT product_ingredients_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
);
CREATE TABLE public.product_modifier_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  name text NOT NULL,
  min_selection integer DEFAULT 0,
  max_selection integer DEFAULT 1,
  CONSTRAINT product_modifier_groups_pkey PRIMARY KEY (id),
  CONSTRAINT product_modifier_groups_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_modifier_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid,
  name text NOT NULL,
  extra_price numeric DEFAULT 0,
  CONSTRAINT product_modifier_options_pkey PRIMARY KEY (id),
  CONSTRAINT product_modifier_options_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.product_modifier_groups(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  category_id uuid,
  available boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.promotion_venues (
  promotion_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  CONSTRAINT promotion_venues_pkey PRIMARY KEY (promotion_id, venue_id),
  CONSTRAINT promotion_venues_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promotion_venues_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_percentage numeric,
  special_price numeric,
  image_url text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  applicable_days ARRAY,
  active boolean DEFAULT true,
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text CHECK (role = ANY (ARRAY['admin'::text, 'superadmin'::text])),
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.venue_menu_combos (
  menu_id uuid NOT NULL,
  combo_id uuid NOT NULL,
  CONSTRAINT venue_menu_combos_pkey PRIMARY KEY (menu_id, combo_id),
  CONSTRAINT venue_menu_combos_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.venue_menus(id),
  CONSTRAINT venue_menu_combos_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id)
);
CREATE TABLE public.venue_menu_products (
  menu_id uuid NOT NULL,
  product_id uuid NOT NULL,
  CONSTRAINT venue_menu_products_pkey PRIMARY KEY (menu_id, product_id),
  CONSTRAINT venue_menu_products_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.venue_menus(id),
  CONSTRAINT venue_menu_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.venue_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid,
  name text NOT NULL,
  is_shared boolean DEFAULT false,
  active boolean DEFAULT true,
  CONSTRAINT venue_menus_pkey PRIMARY KEY (id),
  CONSTRAINT venue_menus_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  whatsapp text,
  google_maps_url text,
  schedule_opening time without time zone,
  schedule_closing time without time zone,
  schedule_active_days ARRAY,
  active boolean DEFAULT true,
  image_url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT venues_pkey PRIMARY KEY (id)
);