# 🗄️ Database Setup Guide

## Prerequisites
1. **XAMPP installed** and running
2. **MySQL service started** in XAMPP Control Panel

## Step 1: Create .env file
Create a file called `.env` in the `backend` folder with this content:

```env
# Database Configuration for XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=chick_n_needs
DB_PORT=3306

# JWT Secret
JWT_SECRET=chick-n-needs-secret-key-2024

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 2: Set up MySQL Database
1. **Open phpMyAdmin**: http://localhost/phpmyadmin
2. **Create Database**: Click "New" → Enter "chick_n_needs" → Click "Create"
3. **Import Schema**: Click on "chick_n_needs" database → Click "Import" → Choose file `backend/database/schema.sql` → Click "Go"

## Step 3: Test Database Connection
1. **Start your backend server**: `npm run dev`
2. **Check console** for database connection message:
   ```
   ✅ Database connected successfully!
   📊 Database: chick_n_needs
   🌐 Host: localhost:3306
   ```

## Step 4: Test Authentication
1. **Register a new user** at `/api/auth/register`
2. **Login** with the registered user at `/api/auth/login`
3. **Check database** to see if user was created

## Troubleshooting
- **"Database connection failed"**: Make sure XAMPP MySQL is running
- **"Table doesn't exist"**: Make sure you imported the schema.sql file
- **"Access denied"**: Check your .env file database credentials

## Demo Account
After setup, you can use:
- **Email**: demo@example.com
- **Password**: password123
