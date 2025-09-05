@echo off
echo ========================================
echo   Chick'N Needs Database Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo 💡 Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "setup.js" (
    echo ❌ setup.js not found
    echo 💡 Please run this script from the database directory
    pause
    exit /b 1
)

echo 🔍 Checking prerequisites...
echo.

REM Check if XAMPP is running (optional check)
echo 💡 Make sure XAMPP is running and MySQL is started
echo 💡 You can check at: http://localhost/phpmyadmin
echo.

REM Run the setup script
echo 🚀 Starting database setup...
echo.
node setup.js

echo.
echo ========================================
echo   Setup completed!
echo ========================================
echo.
echo 📝 Next steps:
echo 1. Check your .env file has correct database settings
echo 2. Start your backend: cd .. && npm run dev
echo 3. Test the API endpoints
echo.
pause
