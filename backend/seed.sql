-- Clear existing data (delete in correct order due to foreign keys)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM purchase_orders;
DELETE FROM daily_summaries;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;

-- Seed data for categories
INSERT INTO categories (name, description) VALUES
('grocery', 'Daily grocery essentials'),
('dairy', 'Milk, cheese, yogurt and more'),
('snacks', 'Chips, biscuits and munchies'),
('beverages', 'Juices, coffee, tea and drinks'),
('household', 'Cleaning and home care'),
('lifestyles', 'Personal care and wellness items'),
('fashion', 'Clothing, accessories and fashion items');

-- Seed data for products
INSERT INTO products (name, description, price, category_id, stock, image_url) VALUES
-- Grocery (8 items)
('Rice', 'Premium basmati rice, 1kg pack', 50.00, 1, 120, ''),
('Bread', 'Fresh white bread loaf', 15.00, 1, 100, ''),
('Sugar', 'Refined sugar, 1kg', 25.00, 1, 140, ''),
('Cooking Oil', 'Pure cooking oil, 1L', 90.00, 1, 110, ''),
('Wheat Flour', 'Whole wheat flour, 1kg', 35.00, 1, 95, ''),
('Salt', 'Iodized salt, 500g', 10.00, 1, 200, ''),
('Lentils', 'Red lentils (masoor dal), 500g', 45.00, 1, 85, ''),
('Spices Mix', 'Garam masala spice mix, 100g', 30.00, 1, 130, ''),

-- Dairy (6 items)
('Milk', 'Fresh cow milk, 500ml', 30.00, 2, 80, ''),
('Cheese', 'Cheddar cheese block, 200g', 80.00, 2, 70, ''),
('Yogurt', 'Plain yogurt, 200g', 20.00, 2, 130, ''),
('Butter', 'Salted butter, 100g', 50.00, 2, 105, ''),
('Paneer', 'Fresh cottage cheese, 200g', 60.00, 2, 90, ''),
('Cream', 'Fresh cream, 200ml', 40.00, 2, 75, ''),

-- Snacks (6 items)
('Chips', 'Crispy salted potato chips', 20.00, 3, 150, ''),
('Cookies', 'Chocolate chip cookies pack', 35.00, 3, 120, ''),
('Biscuits', 'Cream biscuits pack', 30.00, 3, 160, ''),
('Namkeen', 'Mixed namkeen, 200g', 25.00, 3, 110, ''),
('Popcorn', 'Microwave popcorn, salted', 15.00, 3, 140, ''),
('Chocolates', 'Milk chocolate bar, 100g', 50.00, 3, 95, ''),

-- Beverages (5 items)
('Tea', 'Premium tea leaves, 100g', 40.00, 4, 90, ''),
('Coffee', 'Ground coffee beans, 100g', 45.00, 4, 85, ''),
('Juice', 'Orange juice, 1L', 40.00, 4, 100, ''),
('Soda', 'Cola soft drink, 600ml', 25.00, 4, 120, ''),
('Energy Drink', 'Energy drink, 250ml', 35.00, 4, 80, ''),

-- Household (5 items)
('Soap', 'Lavender scented soap bar', 25.00, 5, 200, ''),
('Detergent', 'Laundry detergent powder, 1kg', 70.00, 5, 90, ''),
('Toothpaste', 'Fluoride toothpaste, 100g', 35.00, 5, 125, ''),
('Dish Soap', 'Dishwashing liquid, 500ml', 45.00, 5, 100, ''),
('Cleaning Cloth', 'Microfiber cleaning cloth pack', 20.00, 5, 150, ''),

-- Lifestyles (6 items)
('Shampoo', 'Herbal shampoo, 200ml', 60.00, 6, 110, ''),
('Deodorant', 'Men''s deodorant spray, 150ml', 55.00, 6, 95, ''),
('Perfume', 'Floral perfume, 50ml', 120.00, 6, 60, ''),
('Face Wash', 'Gentle face wash, 100ml', 70.00, 6, 85, ''),
('Hair Oil', 'Coconut hair oil, 200ml', 50.00, 6, 100, ''),
('Body Lotion', 'Moisturizing body lotion, 300ml', 80.00, 6, 70, ''),

-- Fashion (6 items)
('T-Shirt', 'Cotton round neck t-shirt', 150.00, 7, 200, ''),
('Jeans', 'Blue denim jeans', 300.00, 7, 150, ''),
('Sneakers', 'Comfortable running shoes', 250.00, 7, 120, ''),
('Watch', 'Digital wrist watch', 200.00, 7, 100, ''),
('Sunglasses', 'UV protection sunglasses', 120.00, 7, 180, ''),
('Cap', 'Baseball cap with logo', 80.00, 7, 160, '');

-- Seed admin user (password: admin123 - hashed)
INSERT OR IGNORE INTO users (email, password_hash, name, address, phone) VALUES
('admin@store.com', '$2b$10$example.hash.here', 'Admin User', '123 Store St, Mumbai, India', '+91-9876543210');