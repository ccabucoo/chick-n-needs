# Chick'N Needs Backend - MySQL Setup

## 🗄️ **Database Setup with XAMPP**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Configure Environment**
1. Copy `env.example` to `.env`
2. Update database settings if needed:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=chick_n_needs
   DB_PORT=3306
   ```

### **Step 3: Start XAMPP**
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Click **Admin** button next to MySQL (opens phpMyAdmin)

### **Step 4: Create Database**
1. In phpMyAdmin, click **New** on the left sidebar
2. Enter database name: `chick_n_needs`
3. Click **Create**

### **Step 5: Import Schema**
1. Select the `chick_n_needs` database
2. Click **Import** tab
3. Choose file: `database/schema.sql`
4. Click **Go** to execute

### **Step 6: Start Server**
```bash
npm run dev
```

## 🔐 **Demo Account**
- **Email**: `demo@example.com`
- **Password**: `password123`

## 📊 **Database Tables**
- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `wishlist` - User wishlists
- `orders` - Customer orders
- `order_items` - Order line items
- `notifications` - User notifications

## 🚀 **Features**
- ✅ MySQL database with proper relationships
- ✅ User authentication with JWT
- ✅ Product management
- ✅ Shopping cart functionality
- ✅ Wishlist management
- ✅ Order processing
- ✅ Rate limiting and security

## 🔧 **Troubleshooting**
- **Connection failed**: Make sure XAMPP MySQL is running
- **Database not found**: Create database first
- **Tables missing**: Import schema.sql file
- **Port conflicts**: Check if port 5000 is available
