-- 01_init.sql
-- Seed data from mock JSON files for Alitas Company.
-- Run this after running the migration schema.

-- 1. Categories
INSERT INTO categories ( name, icon, "order", active) VALUES
(1, 'Alitas', 'fire', 1, true),
(2, 'Bebidas', 'coffee', 2, true),
(3, 'Combos', 'gift', 3, true);

-- 2. Venues
INSERT INTO venues ( name, address, phone, whatsapp, google_maps_url, schedule_opening, schedule_closing, schedule_active_days, active, image_url) VALUES
('Alitas - Estadio', 'Popayan, Ciudad Jardin', '+57 300 000 0001', '+57 300 000 0000', 'https://www.google.com/maps/embed?pb=...', '11:00', '22:00', ARRAY['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'], true, 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop'),
('Alitas - Catay', 'Popayan, Catay', '+57 300 000 0002', '+57 300 000 0000', 'https://www.google.com/maps/embed?pb=...', '11:00', '22:00', ARRAY['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'], true, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600&auto=format&fit=crop');

-- 3. Products
INSERT INTO products ( name, description, price, image_url, category_ available, featured, allergens, customizations) VALUES
('Alitas Clásica (x6)', '6 Alitas bañadas en tu salsa favorita, acompañadas de apio y zanahoria.', 18000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', 1, true, true, ARRAY['Gluten', 'Lácteos'], ARRAY['Salsa BBQ', 'Salsa Miel Mostaza', 'Salsa Bufalo']),
('Coca Cola 400ml', 'Bebida gaseosa refrescante.', 4500, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop', 2, true, false, ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
('Jugo Natural de Mango', 'Jugo 100% natural, puedes elegirlo en agua o en leche.', 6500, 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=600&auto=format&fit=crop', 2, true, false, ARRAY['Lácteos'], ARRAY['En agua', 'En leche']);

-- 4. Combos
INSERT INTO combos ( name, description, price, image_url, venue_ids, active, show_savings) VALUES
('Combo Personal Clásico', '6 Alitas Clásicas + Gaseosa 400ml', 21000, 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?q=80&w=600&auto=format&fit=crop', ARRAY['1', '2'], true, true);

-- 5. Combo_Products
INSERT INTO combo_products (combo_ product_ quantity) VALUES
( 1, 1),
( 2, 1);

-- 6. Promotions
INSERT INTO promotions ( title, description, discount_percentage, special_price, image_url, venue_ids, start_date, end_date, applicable_days, active) VALUES
('Martes de 2x1 en Alitas', 'Lleva doble porción de alitas por el precio de una.', 50, NULL, 'https://images.unsplash.com/photo-1605333145465-d4e511ebd558?q=80&w=600&auto=format&fit=crop', ARRAY['1', '2'], '2024-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z', ARRAY['Martes'], true);

-- 7. Users
INSERT INTO users ( name, email, role, active) VALUES
('Administrador Principal', 'admin@alitas.com', 'admin', true),
('Super Administrador', 'super@alitas.com', 'superadmin', true);

-- 8. Venue Menus
INSERT INTO venue_menus ( venue_ name, product_ids, combo_ids, is_shared, active) VALUES
( 1, 'Menú Principal El Estadio', ARRAY['1', '2', '3'], ARRAY['1'], false, true),
( 2, 'Menú Principal Catay', ARRAY['1', '2', '3'], ARRAY['1'], false, false);

-- 9. Reset Sequences so new inserts don't fail due to existing IDs 
-- (Because we manually inserted ID 1, 2, 3 instead of letting it auto-increment, we need to update the sequence tracker)
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('venues_id_seq', (SELECT MAX(id) FROM venues));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('combos_id_seq', (SELECT MAX(id) FROM combos));
SELECT setval('promotions_id_seq', (SELECT MAX(id) FROM promotions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('venue_menus_id_seq', (SELECT MAX(id) FROM venue_menus));
