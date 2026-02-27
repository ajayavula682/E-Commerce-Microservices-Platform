-- =====================================================
-- E-Commerce Platform - Database Seed Data
-- =====================================================

-- =====================================================
-- PRODUCT SERVICE - product_db
-- =====================================================
USE product_db;


-- Clear existing data (optional)
-- TRUNCATE TABLE products;

-- Insert sample products (schema: id, category, description, name, price, stock)
INSERT INTO products (name, description, price, category, stock) VALUES
('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip, 256GB storage, Titanium design', 999.99, 'Electronics', 50),
('Samsung Galaxy S24', 'Flagship Android smartphone with Snapdragon 8 Gen 3, 256GB', 899.99, 'Electronics', 75),
('MacBook Pro 14"', 'M3 Pro chip, 16GB RAM, 512GB SSD, Space Gray', 1999.99, 'Computers', 30),
('Dell XPS 15', 'Intel Core i7, 32GB RAM, 1TB SSD, 4K Display', 1799.99, 'Computers', 25),
('AirPods Pro', 'Wireless earbuds with active noise cancellation and USB-C', 249.99, 'Accessories', 100),
('Sony WH-1000XM5', 'Premium noise-canceling over-ear headphones', 399.99, 'Accessories', 60),
('iPad Air', '10.9-inch Liquid Retina display, M1 chip, 256GB', 749.99, 'Tablets', 45),
('Samsung Tab S9', '11-inch AMOLED display, Snapdragon 8 Gen 2, 256GB', 649.99, 'Tablets', 40),
('Apple Watch Series 9', 'GPS + Cellular, 45mm, Aluminum case', 429.99, 'Wearables', 80),
('Fitbit Charge 6', 'Advanced fitness tracker with heart rate monitoring', 159.99, 'Wearables', 120),
('Logitech MX Master 3S', 'Wireless ergonomic mouse with USB-C charging', 99.99, 'Accessories', 150),
('Magic Keyboard', 'Wireless keyboard with Touch ID for Mac', 149.99, 'Accessories', 90),
('LG 27" 4K Monitor', 'IPS display, HDR10, USB-C connectivity', 449.99, 'Monitors', 35),
('Samsung 32" Curved', 'QLED gaming monitor, 144Hz refresh rate', 549.99, 'Monitors', 28),
('Anker PowerCore 20000', 'Portable charger with 20000mAh capacity', 49.99, 'Accessories', 200),
('Belkin 3-in-1 Charger', 'Wireless charging stand for iPhone, Watch, AirPods', 129.99, 'Accessories', 110),
('Nintendo Switch OLED', 'Gaming console with 7-inch OLED screen, 64GB', 349.99, 'Gaming', 55),
('PlayStation 5', 'Gaming console with 825GB SSD, DualSense controller', 499.99, 'Gaming', 20),
('Xbox Series X', 'Gaming console with 1TB SSD, 4K gaming', 499.99, 'Gaming', 18),
('SteelSeries Arctis 7', 'Wireless gaming headset with surround sound', 149.99, 'Gaming', 65);

-- =====================================================
-- INVENTORY SERVICE - inventory_db
-- =====================================================
USE inventory_db;

-- Clear existing data (optional)
-- TRUNCATE TABLE inventory;

-- Insert inventory for products (schema: id, available_quantity, product_id, reserved_quantity)
INSERT INTO inventory (product_id, available_quantity, reserved_quantity) VALUES
(1, 100, 0),
(2, 150, 0),
(3, 50, 0),
(4, 45, 0),
(5, 200, 0),
(6, 120, 0),
(7, 80, 0),
(8, 70, 0),
(9, 150, 0),
(10, 250, 0),
(11, 300, 0),
(12, 180, 0),
(13, 60, 0),
(14, 50, 0),
(15, 400, 0),
(16, 220, 0),
(17, 100, 0),
(18, 30, 0),
(19, 25, 0),
(20, 130, 0);

-- =====================================================
-- ORDER SERVICE - order_db
-- =====================================================
USE order_db;

-- Clear existing data (optional)
-- TRUNCATE TABLE order_items;
-- TRUNCATE TABLE orders;

-- Insert sample orders (schema: id, created_at, status, total_amount, updated_at, user_id)
-- Note: status ENUM: 'PENDING', 'INVENTORY_RESERVED', 'PAYMENT_PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'
INSERT INTO orders (user_id, status, total_amount, created_at, updated_at) VALUES
(1, 'COMPLETED', 1249.98, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'COMPLETED', 349.99, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'PENDING', 1999.99, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'COMPLETED', 699.98, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'COMPLETED', 899.99, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 'PAYMENT_PROCESSING', 499.98, NOW(), NOW()),
(4, 'PENDING', 749.99, NOW(), NOW()),
(5, 'CANCELLED', 999.99, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 'INVENTORY_RESERVED', 549.99, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 'COMPLETED', 1799.99, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Insert order items (schema: id, price, product_id, quantity, order_id)
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Order 1: iPhone + AirPods
(1, 1, 1, 999.99),
(1, 5, 1, 249.99),
-- Order 2: AirPods Pro
(2, 5, 1, 349.99),
-- Order 3: MacBook Pro
(3, 3, 1, 1999.99),
-- Order 4: AirPods + Magic Keyboard
(4, 5, 1, 249.99),
(4, 12, 3, 149.99),
-- Order 5: Samsung Galaxy
(5, 2, 1, 899.99),
-- Order 6: AirPods + Magic Keyboard
(6, 5, 1, 249.99),
(6, 12, 1, 149.99),
(6, 11, 1, 99.99),
-- Order 7: iPad Air
(7, 7, 1, 749.99),
-- Order 8: iPhone (cancelled)
(8, 1, 1, 999.99),
-- Order 9: Samsung Monitor
(9, 14, 1, 549.99),
-- Order 10: Dell XPS
(10, 4, 1, 1799.99);

-- =====================================================
-- PAYMENT SERVICE - payment_db
-- =====================================================
USE payment_db;

-- Clear existing data (optional)
-- TRUNCATE TABLE payments;

-- Insert payment records (schema: id, amount, created_at, message, order_id, status, transaction_id, updated_at, user_id)
-- Note: status ENUM: 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
INSERT INTO payments (order_id, user_id, amount, status, transaction_id, message, created_at, updated_at) VALUES
(1, 1, 1249.98, 'COMPLETED', 'TXN-2026-001', 'Payment successful', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 349.99, 'COMPLETED', 'TXN-2026-002', 'Payment successful', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 2, 1999.99, 'PENDING', 'TXN-2026-003', 'Payment pending', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 2, 699.98, 'COMPLETED', 'TXN-2026-004', 'Payment successful via PayPal', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 3, 899.99, 'COMPLETED', 'TXN-2026-005', 'Payment successful', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(6, 3, 499.98, 'COMPLETED', 'TXN-2026-006', 'Payment successful', NOW(), NOW()),
(7, 4, 749.99, 'PENDING', 'TXN-2026-007', 'Payment pending', NOW(), NOW()),
(8, 5, 999.99, 'FAILED', 'TXN-2026-008', 'Insufficient funds', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, 4, 549.99, 'COMPLETED', 'TXN-2026-009', 'Payment successful via PayPal', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, 5, 1799.99, 'COMPLETED', 'TXN-2026-010', 'Payment successful', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted data counts
SELECT 'Products' as Table_Name, COUNT(*) as Record_Count FROM product_db.products
UNION ALL
SELECT 'Inventory', COUNT(*) FROM inventory_db.inventory
UNION ALL
SELECT 'Orders', COUNT(*) FROM order_db.orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_db.order_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payment_db.payments;

-- =====================================================
-- USEFUL VERIFICATION QUERIES
-- =====================================================

-- View all products with inventory
-- SELECT p.id, p.name, p.price, p.category, p.stock, 
--        i.available_quantity, i.reserved_quantity
-- FROM product_db.products p
-- LEFT JOIN inventory_db.inventory i ON p.id = i.product_id;

-- View orders with items and payment status
-- SELECT o.id as order_id, o.user_id, o.status as order_status, o.total_amount,
--        oi.product_id, oi.quantity, oi.price,
--        p.status as payment_status, p.message as payment_message
-- FROM order_db.orders o
-- LEFT JOIN order_db.order_items oi ON o.id = oi.order_id
-- LEFT JOIN payment_db.payments p ON o.id = p.order_id
-- ORDER BY o.id;

-- Statistics
-- SELECT 
--     (SELECT COUNT(*) FROM product_db.products) as total_products,
--     (SELECT COUNT(*) FROM order_db.orders) as total_orders,
--     (SELECT SUM(total_amount) FROM order_db.orders WHERE status != 'CANCELLED') as total_revenue,
--     (SELECT COUNT(*) FROM payment_db.payments WHERE status = 'COMPLETED') as successful_payments;
