-- Migration script to update existing Chick'N Needs database
-- This script adds new tables and modifies existing ones based on the ERD
-- Run this AFTER your existing database is set up

USE chick_n_needs;

-- =============================================
-- ADD NEW COLUMNS TO EXISTING TABLES
-- =============================================

-- Add new columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) AFTER birthday,
ADD COLUMN IF NOT EXISTS role ENUM('customer', 'admin') DEFAULT 'customer' AFTER address;

-- Add new columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER sale_percentage;

-- =============================================
-- CREATE NEW TABLES
-- =============================================

-- Address table
CREATE TABLE IF NOT EXISTS address (
  address_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  region VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  city_or_municipality VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order history table
CREATE TABLE IF NOT EXISTS order_history (
  history_id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed') NOT NULL,
  shipping_address TEXT NOT NULL,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment table
CREATE TABLE IF NOT EXISTS payment (
  payment_id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  payment_method ENUM('cash_on_delivery', 'credit_card', 'debit_card', 'bank_transfer', 'gcash', 'paymaya') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Shipping table
CREATE TABLE IF NOT EXISTS shipping (
  shipping_id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  shipping_method_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  actual_delivery_date DATE NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Shipping methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  shipping_method_id VARCHAR(36) PRIMARY KEY,
  method_name VARCHAR(100) NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  estimated_days INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  username VARCHAR(100) NOT NULL,
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  notification_settings_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  order_updates BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT TRUE,
  payment_alerts BOOLEAN DEFAULT TRUE,
  shipping_updates BOOLEAN DEFAULT TRUE,
  system_messages BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_settings (user_id)
);

-- =============================================
-- INSERT DEFAULT DATA FOR NEW TABLES
-- =============================================

-- Insert shipping methods
INSERT IGNORE INTO shipping_methods (shipping_method_id, method_name, description, cost, estimated_days) VALUES
('standard', 'Standard Delivery', 'Regular delivery within 3-5 business days', 50.00, 4),
('express', 'Express Delivery', 'Fast delivery within 1-2 business days', 100.00, 2),
('same_day', 'Same Day Delivery', 'Delivery on the same day (Metro Manila only)', 150.00, 1);

-- Insert notification settings for existing users
INSERT IGNORE INTO notification_settings (notification_settings_id, user_id, order_updates, promotions, payment_alerts, shipping_updates, system_messages, email_notifications)
SELECT 
    CONCAT('notif-settings-', id) as notification_settings_id,
    id as user_id,
    TRUE as order_updates,
    TRUE as promotions,
    TRUE as payment_alerts,
    TRUE as shipping_updates,
    TRUE as system_messages,
    TRUE as email_notifications
FROM users
WHERE id NOT IN (SELECT user_id FROM notification_settings);

-- =============================================
-- CREATE NEW INDEXES
-- =============================================

-- Address indexes
CREATE INDEX IF NOT EXISTS idx_address_user ON address(user_id);
CREATE INDEX IF NOT EXISTS idx_address_default ON address(is_default);

-- Order history indexes
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_user ON order_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created ON order_history(created_at);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_method ON payment(payment_method);

-- Shipping indexes
CREATE INDEX IF NOT EXISTS idx_shipping_order ON shipping(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_status ON shipping(status);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking ON shipping(tracking_number);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =============================================
-- CREATE VIEWS
-- =============================================

-- View for user profile with address
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.username,
    u.email,
    u.birthday,
    u.phone_number,
    u.address,
    u.role,
    u.created_at,
    a.region,
    a.province,
    a.city_or_municipality,
    a.barangay,
    a.zip
FROM users u
LEFT JOIN address a ON u.id = a.user_id AND a.is_default = TRUE;

-- View for product details with category
CREATE OR REPLACE VIEW product_details AS
SELECT 
    p.id as product_id,
    p.name,
    p.category_id,
    c.name as category_name,
    p.subcategory,
    p.price,
    p.original_price,
    p.stock,
    p.unit,
    p.description,
    p.specifications,
    p.images,
    p.tags,
    p.rating,
    p.reviews,
    p.is_popular,
    p.is_new,
    p.is_on_sale,
    p.sale_percentage,
    p.is_active,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- View for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id as order_id,
    o.user_id,
    u.first_name,
    u.last_name,
    u.email,
    o.total_amount,
    o.status,
    o.payment_status,
    o.tracking_number,
    o.estimated_delivery,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

SELECT 'Migration completed successfully!' as message;
