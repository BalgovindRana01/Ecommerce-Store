-- Add electronic category and products
INSERT OR IGNORE INTO categories (name, description) VALUES ('electronic', 'Electronic devices and accessories');

-- Add electronic products
INSERT OR IGNORE INTO products (name, price, category_id, emoji, description, stock) VALUES
('Smartphone', 25000, (SELECT id FROM categories WHERE name = 'electronic'), '📱', 'Latest smartphone with advanced features', 50),
('Laptop', 75000, (SELECT id FROM categories WHERE name = 'electronic'), '💻', 'High-performance laptop for work and gaming', 20),
('Smart Watch', 15000, (SELECT id FROM categories WHERE name = 'electronic'), '⌚', 'Fitness tracking smart watch', 30),
('Wireless Headphones', 5000, (SELECT id FROM categories WHERE name = 'electronic'), '🎧', 'Noise-cancelling wireless headphones', 40),
('Data Cable', 300, (SELECT id FROM categories WHERE name = 'electronic'), '🔌', 'USB-C to USB data cable, 2m', 100),
('Power Bank', 2000, (SELECT id FROM categories WHERE name = 'electronic'), '🔋', '10000mAh portable power bank', 60),
('Bluetooth Speaker', 3000, (SELECT id FROM categories WHERE name = 'electronic'), '🔊', 'Portable Bluetooth speaker with deep bass', 35),
('Tablet', 35000, (SELECT id FROM categories WHERE name = 'electronic'), '📱', '10-inch Android tablet for entertainment', 25);