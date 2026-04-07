-- 1. Asegurar permisos básicos al esquema público para los roles de Supabase
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Dar permisos de lectura/escritura en las tablas existentes (para pruebas)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Configurar RLS (Row Level Security) para la tabla categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todo el mundo (Público)
DROP POLICY IF EXISTS "Allow public read" ON categories;
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);

-- Política para permitir inserción/edición (Para pruebas)
DROP POLICY IF EXISTS "Allow all for testing" ON categories;
CREATE POLICY "Allow all for testing" ON categories FOR ALL USING (true);
