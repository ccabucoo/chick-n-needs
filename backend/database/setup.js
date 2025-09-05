#!/usr/bin/env node

/**
 * Database Setup Script for Chick'N Needs
 * This script helps set up the database schema and initial data
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

const databaseName = process.env.DB_NAME || 'chick_n_needs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  try {
    log('🔍 Testing database connection...', 'cyan');
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    await connection.end();
    log('✅ Database connection successful!', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function createDatabase() {
  try {
    log('📦 Creating database...', 'cyan');
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    log(`✅ Database '${databaseName}' created successfully!`, 'green');
    
    await connection.end();
    return true;
  } catch (error) {
    log(`❌ Failed to create database: ${error.message}`, 'red');
    return false;
  }
}

async function runSQLFile(filePath) {
  try {
    log(`📄 Reading SQL file: ${filePath}`, 'cyan');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`SQL file not found: ${filePath}`);
    }
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    log('🔧 Executing SQL commands...', 'cyan');
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: databaseName
    });
    
    await connection.execute(sqlContent);
    await connection.end();
    
    log('✅ SQL file executed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to execute SQL file: ${error.message}`, 'red');
    return false;
  }
}

async function verifySetup() {
  try {
    log('🔍 Verifying database setup...', 'cyan');
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: databaseName
    });
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    log(`📊 Found ${tables.length} tables in database`, 'blue');
    
    // Check sample data
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    log(`📦 Products: ${products[0].count}`, 'blue');
    log(`📂 Categories: ${categories[0].count}`, 'blue');
    log(`👥 Users: ${users[0].count}`, 'blue');
    
    await connection.end();
    
    if (products[0].count > 0 && categories[0].count > 0 && users[0].count > 0) {
      log('✅ Database setup verification successful!', 'green');
      return true;
    } else {
      log('⚠️  Database setup incomplete - some tables are empty', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Chick\'N Needs Database Setup', 'bright');
  log('================================', 'bright');
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    log('\n💡 Make sure XAMPP is running and MySQL is started', 'yellow');
    log('💡 Check your database credentials in .env file', 'yellow');
    process.exit(1);
  }
  
  // Create database
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    process.exit(1);
  }
  
  // Determine which SQL file to use
  const args = process.argv.slice(2);
  let sqlFile;
  
  if (args.includes('--migration') || args.includes('-m')) {
    sqlFile = path.join(__dirname, 'migration_script.sql');
    log('🔄 Running migration script...', 'yellow');
  } else {
    sqlFile = path.join(__dirname, 'complete_schema.sql');
    log('🆕 Running complete schema setup...', 'yellow');
  }
  
  // Execute SQL file
  const sqlExecuted = await runSQLFile(sqlFile);
  if (!sqlExecuted) {
    process.exit(1);
  }
  
  // Verify setup
  const verified = await verifySetup();
  
  log('\n🎉 Database setup completed!', 'green');
  log('================================', 'bright');
  
  if (verified) {
    log('✅ Your database is ready to use!', 'green');
    log('\n📝 Next steps:', 'cyan');
    log('1. Update your .env file with database credentials', 'blue');
    log('2. Start your backend server: npm run dev', 'blue');
    log('3. Test the API endpoints', 'blue');
    log('4. Run the contact form test', 'blue');
  } else {
    log('⚠️  Setup completed but verification failed', 'yellow');
    log('💡 Check the database manually in phpMyAdmin', 'yellow');
  }
  
  log('\n🔗 Useful links:', 'cyan');
  log('• phpMyAdmin: http://localhost/phpmyadmin', 'blue');
  log('• Database: ' + databaseName, 'blue');
  log('• Backend API: http://localhost:5000/api', 'blue');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Chick\'N Needs Database Setup Script', 'bright');
  log('====================================', 'bright');
  log('');
  log('Usage:', 'cyan');
  log('  node setup.js                 # Run complete schema setup');
  log('  node setup.js --migration     # Run migration script');
  log('  node setup.js --help          # Show this help');
  log('');
  log('Environment Variables:', 'cyan');
  log('  DB_HOST     - Database host (default: localhost)');
  log('  DB_USER     - Database user (default: root)');
  log('  DB_PASSWORD - Database password (default: empty)');
  log('  DB_PORT     - Database port (default: 3306)');
  log('  DB_NAME     - Database name (default: chick_n_needs)');
  log('');
  process.exit(0);
}

// Run the setup
main().catch(error => {
  log(`💥 Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
