# Chick'N Needs Database Setup Guide

This guide will help you set up the complete database schema for the Chick'N Needs e-commerce platform based on the provided ERD.

## 📋 Prerequisites

- XAMPP installed and running
- MySQL/MariaDB server running
- phpMyAdmin access (optional but recommended)

## 🚀 Setup Options

### Option 1: Fresh Installation (Recommended for new projects)

If you're starting fresh or want to completely rebuild your database:

1. **Open phpMyAdmin** (http://localhost/phpmyadmin)
2. **Create a new database** named `chick_n_needs`
3. **Import the complete schema**:
   - Go to the `chick_n_needs` database
   - Click "Import" tab
   - Choose file: `complete_schema.sql`
   - Click "Go"

### Option 2: Migration (For existing projects)

If you already have a Chick'N Needs database and want to add the new tables:

1. **Backup your existing database** first!
2. **Run the migration script**:
   - Go to your existing `chick_n_needs` database
   - Click "Import" tab
   - Choose file: `migration_script.sql`
   - Click "Go"

### Option 3: Command Line Setup

If you prefer using MySQL command line:

```bash
# Navigate to the database directory
cd backend/database

# For fresh installation
mysql -u root -p < complete_schema.sql

# For migration
mysql -u root -p chick_n_needs < migration_script.sql
```

## 📊 Database Structure

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User accounts | Authentication, profiles, roles |
| `address` | User addresses | Multiple addresses per user |
| `categories` | Product categories | Hierarchical categories |
| `products` | Product catalog | Full product information |
| `cart` | Shopping cart | Temporary cart items |
| `wishlist` | User wishlists | Saved for later items |

### Order Management

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `orders` | Order records | Order status, totals |
| `order_items` | Order line items | Individual products in orders |
| `order_history` | Order tracking | Status change history |
| `payment` | Payment records | Payment methods, status |
| `shipping` | Shipping details | Delivery tracking |
| `shipping_methods` | Shipping options | Available delivery methods |

### User Experience

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `reviews` | Product reviews | Ratings, comments, moderation |
| `notifications` | User notifications | Order updates, promotions |
| `notification_settings` | User preferences | Notification preferences |
| `contact_submissions` | Contact form | Customer inquiries |

## 🔧 Key Features

### 1. **User Management**
- Complete user profiles with addresses
- Role-based access (customer/admin)
- Multiple addresses per user
- Notification preferences

### 2. **Product Catalog**
- Hierarchical categories
- Rich product information (JSON specs, images, tags)
- Stock management
- Ratings and reviews
- Sale pricing

### 3. **Shopping Experience**
- Shopping cart functionality
- Wishlist management
- Order tracking
- Multiple payment methods
- Shipping options

### 4. **Order Management**
- Complete order lifecycle
- Payment tracking
- Shipping management
- Order history
- Status notifications

### 5. **Reviews & Feedback**
- Product reviews with ratings
- Review moderation
- Contact form submissions
- User notifications

## 📈 Performance Optimizations

### Indexes
- All foreign keys are indexed
- Frequently queried columns have indexes
- Composite indexes for complex queries

### Views
- `user_profiles`: User data with default address
- `product_details`: Products with category information
- `order_summary`: Order data with item counts

### Stored Procedures
- `GetUserCart()`: Retrieve cart with product details
- `GetUserWishlist()`: Retrieve wishlist with product details
- `GetOrderDetails()`: Retrieve complete order information

## 🔒 Security Features

### Data Validation
- ENUM constraints for status fields
- CHECK constraints for ratings
- Foreign key constraints
- NOT NULL constraints where appropriate

### Triggers
- Automatic product rating updates
- Order status change notifications
- Data consistency maintenance

## 🧪 Sample Data

The schema includes sample data:
- **Categories**: Feeds, Vaccines, Equipment, Housing, Other Supplies
- **Products**: 5 sample poultry products
- **Shipping Methods**: Standard, Express, Same Day
- **Demo User**: test@example.com (password: password123)

## 🔍 Testing the Setup

After setup, verify everything works:

1. **Check tables exist**:
   ```sql
   SHOW TABLES;
   ```

2. **Verify sample data**:
   ```sql
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM categories;
   SELECT COUNT(*) FROM users;
   ```

3. **Test relationships**:
   ```sql
   SELECT p.name, c.name as category 
   FROM products p 
   JOIN categories c ON p.category_id = c.id;
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Foreign Key Errors**:
   - Ensure all referenced tables exist
   - Check data types match exactly
   - Verify referenced records exist

2. **Permission Errors**:
   - Ensure MySQL user has CREATE, INSERT, UPDATE, DELETE privileges
   - Check database user permissions

3. **Character Set Issues**:
   - Ensure UTF-8 character set is used
   - Check collation settings

### Getting Help

If you encounter issues:
1. Check MySQL error logs
2. Verify XAMPP services are running
3. Ensure database connection settings are correct
4. Check for syntax errors in SQL files

## 📝 Next Steps

After successful database setup:

1. **Update your .env file** with correct database credentials
2. **Test your backend API** endpoints
3. **Verify frontend connections** to the database
4. **Run the contact form test** to ensure everything works

## 🔄 Maintenance

### Regular Tasks
- Monitor database performance
- Update indexes as needed
- Clean up old order history
- Archive completed orders
- Update product information

### Backup Strategy
- Regular database backups
- Test backup restoration
- Monitor disk space
- Keep backup copies off-site

---

**Note**: This database schema is designed to be scalable and maintainable. It follows best practices for e-commerce applications and includes all necessary features for a complete poultry supplies e-commerce platform.
