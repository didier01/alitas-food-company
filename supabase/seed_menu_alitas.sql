-- Archivo de inserción preparado para Supabase (UUIDs relacionales)
-- Considera que si las categorías con los IDs definidos abajo ya existen arrojarán error, 
-- por prudencia usamos la sintaxis básica, o actualizamos si chocan.

-- 1. Inserción de Categorías
INSERT INTO categories (id, name, "order", active) VALUES 
('c0000000-0000-0000-0000-000000000000', 'Combos', 1, true),
('c0000000-0000-0000-0000-000000000001', 'Boneless', 2, true),
('c0000000-0000-0000-0000-000000000002', 'Strips de Pollo', 3, true),
('c0000000-0000-0000-0000-000000000003', 'Porciones', 4, true),
('c0000000-0000-0000-0000-000000000004', 'Bebidas', 5, true),
('c0000000-0000-0000-0000-000000000005', 'Sodas Saborizadas', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Inserción de Combos (Categoría "Combos" separada en tu sistema)
INSERT INTO combos (id, name, description, price, active, show_savings) VALUES
('b0000000-0000-0000-0000-000000000001', 'Combo 1', '6 piezas de alitas, acompañante, 1 salsa', 20800, true, true),
('b0000000-0000-0000-0000-000000000002', 'Combo 2', '12 piezas de alitas, acompañante, 2 salsas', 41600, true, true),
('b0000000-0000-0000-0000-000000000003', 'Combo 3', '18 piezas de alitas, acompañante, 3 salsas', 62400, true, true),
('b0000000-0000-0000-0000-000000000004', 'Combo 4', '24 piezas de alitas, acompañante, 4 salsas', 83200, true, true)
ON CONFLICT (id) DO NOTHING;

-- Nota: Recordar correr inserts en combo_products y combo_venues para habilitarlos a sus sedes y añadir productos internos

-- 3. Inserción de Productos
INSERT INTO products (id, name, description, price, category_id, available, featured) VALUES
-- Boneless
(gen_random_uuid(), 'Personal', 'Boneles Personal', 22000, 'c0000000-0000-0000-0000-000000000001', true, false),
(gen_random_uuid(), 'Grande', 'Boneles Grande', 40600, 'c0000000-0000-0000-0000-000000000001', true, false),
(gen_random_uuid(), 'Familiar', 'Boneles Familiar', 56800, 'c0000000-0000-0000-0000-000000000001', true, true),

-- Strips de Pollo
(gen_random_uuid(), 'Strips', 'Strips de Pollo', 22800, 'c0000000-0000-0000-0000-000000000002', true, true),

-- Porciones
(gen_random_uuid(), 'Unidad de Ala', 'Porción individual de Ala', 3800, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Porción de salsa', 'Cualquier salsa de la casa o clásica a elección', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Porción de papas', 'Acompañante', 8000, 'c0000000-0000-0000-0000-000000000003', true, false),

-- Salsas (Guardadas como Productos "Extras" u Opcionales en la categoría Porciones)
-- Salsas de la Casa
(gen_random_uuid(), 'Salsa Sweet Chili', 'Salsas de la Casa', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Salsa Bufalo', 'Salsas de la Casa', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Salsa Cheddar', 'Salsas de la Casa', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
-- Salsas Clásicas
(gen_random_uuid(), 'Salsa Bqq', 'Salsas Clásicas', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Salsa Miel Mostaza', 'Salsas Clásicas', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),
(gen_random_uuid(), 'Salsa Teriyaki', 'Salsas Clásicas', 3000, 'c0000000-0000-0000-0000-000000000003', true, false),

-- Bebidas
(gen_random_uuid(), 'Limonada natural', 'Bebida individual', 7000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Limonada de coco', 'Bebida individual', 13000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Limonada de hierba buena', 'Bebida individual', 10000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Jugo en agua', 'Bebida individual', 7000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Jugo en leche', 'Bebida individual', 8000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Jarra de jugo en agua', 'Jarra para compartir', 17000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Jarra de jugo en leche', 'Jarra para compartir', 19000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Jarra de limonada', 'Jarra para compartir', 16000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Cerveza nacional', 'Cerveza botella', 7000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Cerveza nacional Michelada', 'Cerveza michelada', 9000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Gaseosas personales', 'Gaseosa individual', 5000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Gaseosa litro', 'Gaseosa tamaño litro', 7000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Gaseosa litro 1/2', 'Gaseosa tamaño litro y medio', 10000, 'c0000000-0000-0000-0000-000000000004', true, false),

-- Sodas Saborizadas
(gen_random_uuid(), 'Soda saborizada Maracuya', 'Bebida Premium', 12000, 'c0000000-0000-0000-0000-000000000005', true, false),
(gen_random_uuid(), 'Soda saborizada Frutos Rojos', 'Bebida Premium', 12000, 'c0000000-0000-0000-0000-000000000005', true, false);
