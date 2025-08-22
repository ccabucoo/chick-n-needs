-- Chick'N Needs Database Schema
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chick_n_needs;
USE chick_n_needs;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthday DATE NULL,
  phone VARCHAR(20),
  address TEXT,
  farm_type VARCHAR(100),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(100),
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'promotion', 'payment', 'shipping', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT IGNORE INTO categories (name, description, icon) VALUES
('Live Chickens', 'Day-old chicks, pullets, and mature birds', '🐔'),
('Feeds & Supplements', 'Complete feeds, vitamins, and minerals', '🌾'),
('Vaccines & Medicines', 'Health products and medications', '💊'),
('Equipment & Tools', 'Feeders, drinkers, and farm equipment', '🔧'),
('Housing & Materials', 'Coops, cages, and building materials', '🏠'),
('Other Supplies', 'Miscellaneous poultry farming supplies', '📦');

-- Insert demo user (password: password123)
INSERT IGNORE INTO users (id, first_name, last_name, username, name, email, password, birthday, phone, address, farm_type, role) VALUES
('1', 'Demo', 'User', 'demo', 'Demo User', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '+63 912 345 6789', '123 Poultry Street, Manila, Philippines', 'Commercial', 'customer');

-- Insert sample products
INSERT IGNORE INTO products (id, name, category_id, subcategory, price, original_price, stock, unit, description, specifications, images, tags, rating, reviews, is_popular, is_new, is_on_sale, sale_percentage) VALUES
('1', 'Broiler Chicks (Day Old)', 1, 'Broilers', 45.00, 50.00, 500, 'piece', 'High-quality day-old broiler chicks for meat production. Fast-growing, healthy, and disease-resistant.', '{"breed": "Cobb 500", "age": "1 day", "weight": "40-45g", "vaccination": "Marek\'s Disease", "growthRate": "Fast (6-8 weeks to market weight)"}', '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400", "https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400"]', '["broiler", "meat", "fast-growing", "commercial"]', 4.8, 156, TRUE, FALSE, TRUE, 10),
('2', 'Layer Feed (20kg)', 2, 'Complete Feeds', 850.00, 900.00, 100, 'bag', 'Complete layer feed with balanced nutrition for egg production. Contains essential vitamins and minerals.', '{"weight": "20kg", "protein": "16%", "calcium": "3.5%", "energy": "2800 kcal/kg", "suitableFor": "Laying hens"}', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', '["feed", "layers", "nutrition", "eggs"]', 4.6, 89, TRUE, FALSE, TRUE, 6),
('3', 'Automatic Feeder', 4, 'Feeders', 1200.00, NULL, 25, 'piece', 'Automatic chicken feeder with gravity flow system. Holds up to 10kg of feed and prevents waste.', '{"capacity": "10kg", "material": "Plastic", "type": "Gravity flow", "suitableFor": "All chicken types", "installation": "Easy"}', '["https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400"]', '["feeder", "automatic", "waste-prevention", "easy-install"]', 4.7, 67, FALSE, TRUE, FALSE, 0);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
