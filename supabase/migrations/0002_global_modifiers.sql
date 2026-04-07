-- 1. Eliminar las tablas JSON y antiguas no relacionales
ALTER TABLE public.products DROP COLUMN IF EXISTS modifier_groups;
ALTER TABLE public.combos DROP COLUMN IF EXISTS modifier_groups;

DROP TABLE IF EXISTS public.product_modifier_options CASCADE;
DROP TABLE IF EXISTS public.product_modifier_groups CASCADE;

-- 2. Entidades Globales de Grupos de Extras
CREATE TABLE public.modifier_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL, -- Ej: 'Salsas de la Casa'
  CONSTRAINT modifier_groups_pkey PRIMARY KEY (id)
);

-- Las opciones del grupo simplemente actúan como conectores hacia tus Productos
CREATE TABLE public.modifier_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT modifier_options_pkey PRIMARY KEY (id)
);

-- 3. Tabla Intermedia para asignar grupos a PRODUCTOS (y definir las reglas)
CREATE TABLE public.product_modifier_groups (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  min_selection integer DEFAULT 0,
  max_selection integer DEFAULT 1,
  free_selections integer DEFAULT 0, -- Regla de gratis
  CONSTRAINT product_modifier_groups_pkey PRIMARY KEY (product_id, group_id)
);

-- 4. Tabla Intermedia para asignar grupos a COMBOS (y definir las reglas)
CREATE TABLE public.combo_modifier_groups (
  combo_id uuid NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  min_selection integer DEFAULT 0,
  max_selection integer DEFAULT 1,
  free_selections integer DEFAULT 0, -- Regla de gratis para combos (Ej: Combo 1 tiene 2 gratis)
  CONSTRAINT combo_modifier_groups_pkey PRIMARY KEY (combo_id, group_id)
);

-- DAR PERMISOS SOBRE LAS NUEVAS TABLAS PARA LA API DE ORO
GRANT ALL ON TABLE public.modifier_groups TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.modifier_options TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_modifier_groups TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.combo_modifier_groups TO anon, authenticated, service_role;
