
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
(gen_random_uuid(), 'Porción de papas', 'Acompañante', 8000, 'c0000000-0000-0000-0000-000000000003', true, false),

-- Bebidas

(gen_random_uuid(), 'Limonada de coco', 'Bebida individual', 13000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Limonada de hierba buena', 'Bebida individual', 10000, 'c0000000-0000-0000-0000-000000000004', true, false),



(gen_random_uuid(), 'Cerveza nacional', 'Cerveza botella', 7000, 'c0000000-0000-0000-0000-000000000004', true, false),
(gen_random_uuid(), 'Cerveza nacional Michelada', 'Cerveza michelada', 9000, 'c0000000-0000-0000-0000-000000000004', true, false),


-- Sodas Saborizadas
(gen_random_uuid(), 'Soda saborizada Maracuya', 'Bebida Premium', 12000, 'c0000000-0000-0000-0000-000000000005', true, false),
(gen_random_uuid(), 'Soda saborizada Frutos Rojos', 'Bebida Premium', 12000, 'c0000000-0000-0000-0000-000000000005', true, false);
