-- Update existing categories to correct names
UPDATE categories SET name = 'grocery', description = 'Daily grocery essentials' WHERE id = 1;
UPDATE categories SET name = 'dairy', description = 'Milk, cheese, yogurt and more' WHERE id = 2;
UPDATE categories SET name = 'snacks', description = 'Chips, biscuits and munchies' WHERE id = 3;
UPDATE categories SET name = 'beverages', description = 'Juices, coffee, tea and drinks' WHERE id = 4;
UPDATE categories SET name = 'household', description = 'Cleaning and home care' WHERE id = 5;
UPDATE categories SET name = 'lifestyles', description = 'Personal care and wellness items' WHERE id = 6;

-- Insert fashion category if it doesn't exist
INSERT OR IGNORE INTO categories (name, description) VALUES ('fashion', 'Clothing, accessories and fashion items');

-- Update product categories by ID ranges
-- Grocery products (IDs 7-14)
UPDATE products SET category_id = 1 WHERE id BETWEEN 7 AND 14;
-- Dairy products (IDs 15-20)
UPDATE products SET category_id = 2 WHERE id BETWEEN 15 AND 20;
-- Snacks products (IDs 21-26)
UPDATE products SET category_id = 3 WHERE id BETWEEN 21 AND 26;
-- Beverages products (IDs 27-31)
UPDATE products SET category_id = 4 WHERE id BETWEEN 27 AND 31;
-- Household products (IDs 32-36)
UPDATE products SET category_id = 5 WHERE id BETWEEN 32 AND 36;
-- Lifestyles products (IDs 37-42)
UPDATE products SET category_id = 6 WHERE id BETWEEN 37 AND 42;
-- Fashion products (IDs 43-48)
UPDATE products SET category_id = 7 WHERE id BETWEEN 43 AND 48;