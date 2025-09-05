-- Chick'N Needs Complete Database Schema
-- Based on the provided ERD for e-commerce platform
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chick_n_needs;
USE chick_n_needs;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthday DATE NULL,
  phone_number VARCHAR(20),
  address TEXT,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- ADDRESS TABLE
-- =============================================
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
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  product_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  subcategory VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'piece',
  description TEXT,
  specifications JSON,
  images JSON,
  tags JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INT DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_on_sale BOOLEAN DEFAULT FALSE,
  sale_percentage INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- =============================================
-- CART TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cart (
  cart_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- =============================================
-- WISHLIST TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  order_quantity INT NOT NULL,
  order_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- =============================================
-- ORDER HISTORY TABLE
-- =============================================
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
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- PAYMENT TABLE
-- =============================================
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
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- SHIPPING TABLE
-- =============================================
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
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- SHIPPING METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  shipping_method_id VARCHAR(36) PRIMARY KEY,
  method_name VARCHAR(100) NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  estimated_days INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
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
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'promotion', 'payment', 'shipping', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- NOTIFICATION SETTINGS TABLE
-- =============================================
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
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_settings (user_id)
);

-- =============================================
-- CONTACT SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  concern_type ENUM('general', 'product_inquiry', 'order_support', 'technical_issue', 'billing', 'partnership', 'feedback', 'complaint') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default categories
INSERT IGNORE INTO categories (category_name, description, icon) VALUES
('Feeds & Supplements', 'Complete feeds, vitamins, and minerals for poultry', '🌾'),
('Vaccines & Medicines', 'Health products and medications for poultry', '💊'),
('Equipment & Tools', 'Feeders, drinkers, and farm equipment', '🔧'),
('Housing & Materials', 'Coops, cages, and building materials', '🏠'),
('Other Supplies', 'Miscellaneous poultry farming supplies', '📦');

-- Insert shipping methods
INSERT IGNORE INTO shipping_methods (shipping_method_id, method_name, description, cost, estimated_days) VALUES
('standard', 'Standard Delivery', 'Regular delivery within 3-5 business days', 50.00, 4),
('express', 'Express Delivery', 'Fast delivery within 1-2 business days', 100.00, 2),
('same_day', 'Same Day Delivery', 'Delivery on the same day (Metro Manila only)', 150.00, 1);

-- Insert demo user (password: password123)
INSERT IGNORE INTO users (user_id, first_name, last_name, username, email, password, birthday, phone_number, address, role) VALUES
('demo-user-001', 'Demo', 'User', 'demo', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-01-01', '+63 912 345 6789', '123 Poultry Street, Manila, Philippines', 'customer');

-- Insert demo address
INSERT IGNORE INTO address (address_id, user_id, region, province, city_or_municipality, barangay, zip, is_default) VALUES
('addr-001', 'demo-user-001', 'NCR', 'Metro Manila', 'Quezon City', 'Barangay 1', '1100', TRUE);

-- Insert sample products
INSERT IGNORE INTO products (product_id, name, category_id, subcategory, price, original_price, stock, unit, description, specifications, images, tags, rating, reviews, is_popular, is_new, is_on_sale, sale_percentage) VALUES
('prod-001', 'Broiler Starter Feed (25kg)', 1, 'Complete Feeds', 850.00, 900.00, 100, 'bag', 'High-quality starter feed for broiler chicks. Contains essential nutrients for healthy growth.', '{"weight": "25kg", "protein": "22%", "energy": "3000 kcal/kg", "suitableFor": "Broiler chicks 0-3 weeks"}', '[]', '["feed", "broiler", "starter", "nutrition"]', 4.8, 156, TRUE, FALSE, TRUE, 6),
('prod-002', 'Layer Feed Premium (20kg)', 1, 'Complete Feeds', 750.00, NULL, 150, 'bag', 'Premium layer feed for maximum egg production. Balanced nutrition for laying hens.', '{"weight": "20kg", "protein": "16%", "calcium": "3.5%", "energy": "2800 kcal/kg", "suitableFor": "Laying hens"}', '[]', '["feed", "layers", "eggs", "premium"]', 4.6, 89, TRUE, FALSE, FALSE, 0),
('prod-003', 'Automatic Feeder (10kg)', 3, 'Feeders', 1200.00, NULL, 25, 'piece', 'Automatic chicken feeder with gravity flow system. Holds up to 10kg of feed and prevents waste.', '{"capacity": "10kg", "material": "Plastic", "type": "Gravity flow", "suitableFor": "All chicken types", "installation": "Easy"}', '[]', '["feeder", "automatic", "waste-prevention", "easy-install"]', 4.7, 67, FALSE, TRUE, FALSE, 0),
('prod-004', 'Poultry Waterer (5L)', 3, 'Waterers', 350.00, 400.00, 50, 'piece', 'Automatic waterer for poultry. Provides clean water and prevents contamination.', '{"capacity": "5L", "material": "Plastic", "type": "Automatic", "suitableFor": "All poultry types"}', '[]', '["waterer", "automatic", "clean-water", "poultry"]', 4.5, 45, FALSE, FALSE, TRUE, 12),
('prod-005', 'Chicken Coop (Small)', 4, 'Housing', 2500.00, NULL, 10, 'piece', 'Small chicken coop suitable for 4-6 chickens. Easy to assemble and maintain.', '{"size": "4x6 feet", "capacity": "4-6 chickens", "material": "Wood and wire", "assembly": "Required"}', '[]', '["coop", "housing", "small", "wood"]', 4.3, 23, FALSE, FALSE, FALSE, 0);

-- Insert notification settings for demo user
INSERT IGNORE INTO notification_settings (notification_settings_id, user_id, order_updates, promotions, payment_alerts, shipping_updates, system_messages, email_notifications) VALUES
('notif-settings-001', 'demo-user-001', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Address indexes
CREATE INDEX idx_address_user ON address(user_id);
CREATE INDEX idx_address_default ON address(is_default);

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_popular ON products(is_popular);
CREATE INDEX idx_products_new ON products(is_new);
CREATE INDEX idx_products_sale ON products(is_on_sale);

-- Cart indexes
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_product ON cart(product_id);

-- Wishlist indexes
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);

-- Orders indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Order history indexes
CREATE INDEX idx_order_history_order ON order_history(order_id);
CREATE INDEX idx_order_history_user ON order_history(user_id);
CREATE INDEX idx_order_history_created ON order_history(created_at);

-- Payment indexes
CREATE INDEX idx_payment_order ON payment(order_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_method ON payment(payment_method);

-- Shipping indexes
CREATE INDEX idx_shipping_order ON shipping(order_id);
CREATE INDEX idx_shipping_status ON shipping(status);
CREATE INDEX idx_shipping_tracking ON shipping(tracking_number);

-- Reviews indexes
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Contact submissions indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_concern ON contact_submissions(concern_type);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at);

-- =============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user profile with address
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.user_id,
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
LEFT JOIN address a ON u.user_id = a.user_id AND a.is_default = TRUE;

-- View for product details with category
CREATE OR REPLACE VIEW product_details AS
SELECT 
    p.product_id,
    p.name,
    p.category_id,
    c.category_name,
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
LEFT JOIN categories c ON p.category_id = c.category_id;

-- View for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.order_id,
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
    COUNT(oi.order_item_id) as item_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id;

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure to get user's cart with product details
CREATE PROCEDURE GetUserCart(IN p_user_id VARCHAR(36))
BEGIN
    SELECT 
        c.cart_id,
        c.quantity,
        p.product_id,
        p.name,
        p.price,
        p.original_price,
        p.stock,
        p.unit,
        p.images,
        p.is_on_sale,
        p.sale_percentage,
        (c.quantity * p.price) as total_price
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC;
END //

-- Procedure to get user's wishlist with product details
CREATE PROCEDURE GetUserWishlist(IN p_user_id VARCHAR(36))
BEGIN
    SELECT 
        w.wishlist_id,
        p.product_id,
        p.name,
        p.price,
        p.original_price,
        p.stock,
        p.unit,
        p.images,
        p.is_on_sale,
        p.sale_percentage,
        p.rating,
        p.reviews,
        w.created_at
    FROM wishlist w
    JOIN products p ON w.product_id = p.product_id
    WHERE w.user_id = p_user_id
    ORDER BY w.created_at DESC;
END //

-- Procedure to get order details with items
CREATE PROCEDURE GetOrderDetails(IN p_order_id VARCHAR(36))
BEGIN
    SELECT 
        o.order_id,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.tracking_number,
        o.estimated_delivery,
        o.created_at,
        oi.order_item_id,
        oi.order_quantity,
        oi.order_price,
        p.name as product_name,
        p.images
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    WHERE o.order_id = p_order_id;
END //

DELIMITER ;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to update product rating when review is approved
DELIMITER //
CREATE TRIGGER update_product_rating 
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE products 
        SET 
            rating = (
                SELECT AVG(rating) 
                FROM reviews 
                WHERE product_id = NEW.product_id 
                AND status = 'approved'
            ),
            reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE product_id = NEW.product_id 
                AND status = 'approved'
            )
        WHERE product_id = NEW.product_id;
    END IF;
END //
DELIMITER ;

-- Trigger to create notification when order status changes
DELIMITER //
CREATE TRIGGER create_order_notification
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO notifications (notification_id, user_id, title, message, type)
        VALUES (
            UUID(),
            NEW.user_id,
            'Order Status Update',
            CONCAT('Your order #', NEW.order_id, ' status has been updated to: ', NEW.status),
            'order'
        );
    END IF;
END //
DELIMITER ;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
SELECT 'Chick\'N Needs database schema created successfully!' as message;
