#!/bin/bash

echo "========================================"
echo "  Chick'N Needs Database Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "💡 Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "setup.js" ]; then
    echo "❌ setup.js not found"
    echo "💡 Please run this script from the database directory"
    exit 1
fi

echo "🔍 Checking prerequisites..."
echo

# Check if MySQL is running (optional check)
echo "💡 Make sure MySQL/MariaDB is running"
echo "💡 You can check with: sudo systemctl status mysql"
echo

# Run the setup script
echo "🚀 Starting database setup..."
echo
node setup.js

echo
echo "========================================"
echo "  Setup completed!"
echo "========================================"
echo
echo "📝 Next steps:"
echo "1. Check your .env file has correct database settings"
echo "2. Start your backend: cd .. && npm run dev"
echo "3. Test the API endpoints"
echo
