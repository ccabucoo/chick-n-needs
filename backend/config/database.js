// This imports the mysql2 library with promise support
// mysql2 is a MySQL database driver for Node.js
// The /promise part means we can use async/await instead of callbacks
// Think of it like having a translator that speaks both Node.js and MySQL
const mysql = require('mysql2/promise');

// This loads environment variables from a .env file
// Environment variables are like secret settings stored outside your code
// This keeps sensitive information like database passwords safe
require('dotenv').config();

// DATABASE CONFIGURATION SECTION
// This object contains all the settings needed to connect to your MySQL database
// Think of it like the address and key to your database house
const dbConfig = {
  // The computer where your database is running
  // process.env.DB_HOST means "get the DB_HOST value from environment variables"
  // || 'localhost' means "if no environment variable, use 'localhost' (your own computer)"
  host: process.env.DB_HOST || 'localhost',
  
  // The username to access the database
  // 'root' is the default administrator username in XAMPP
  user: process.env.DB_USER || 'root',
  
  // The password to access the database
  // Empty string '' means no password (common in XAMPP default setup)
  password: process.env.DB_PASSWORD || '',
  
  // The name of your specific database
  // This is like choosing which room in the database house to use
  database: process.env.DB_NAME || 'chick_n_needs',
  
  // The port number MySQL is running on
  // 3306 is the default MySQL port
  port: process.env.DB_PORT || 3306,
  
  // CONNECTION POOL SETTINGS
  // These settings control how many database connections we can have at once
  
  // If true, the pool will wait for a connection to become available
  // If false, it would immediately fail if no connections are free
  waitForConnections: true,
  
  // Maximum number of connections that can be open at the same time
  // Think of it like having 10 phone lines to the database
  // More connections = more users can use the database simultaneously
  connectionLimit: 10,
  
  // Maximum number of requests waiting for a connection
  // 0 means unlimited - requests will wait as long as needed
  queueLimit: 0
};

// CREATE CONNECTION POOL
// A connection pool is like having multiple phone lines to your database
// Instead of opening/closing a new connection for each request, we reuse existing ones
// This makes your website much faster
const pool = mysql.createPool(dbConfig);

// TEST DATABASE CONNECTION FUNCTION
// This function checks if we can actually connect to the database
// It's like testing if your key works before trying to open the door
const testConnection = async () => {
  try {
    // Try to get a connection from the pool
    // await means "wait for this to complete before continuing"
    const connection = await pool.getConnection();
    
    // If we get here, the connection worked!
    console.log('✅ Database connected successfully!');                    // Success message
    console.log(`📊 Database: ${dbConfig.database}`);                     // Show which database we're using
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);            // Show where the database is located
    
    // Release the connection back to the pool
    // This is important - we're just testing, so we don't need to keep the connection
    connection.release();
    
  } catch (error) {
    // If something goes wrong, this code runs
    // error.message contains what went wrong
    console.error('❌ Database connection failed:', error.message);       // Show the error
    console.log('💡 Make sure XAMPP MySQL is running and the database exists'); // Helpful hint
  }
};

// EXPORT SECTION
// This makes the pool and testConnection function available to other files
// It's like putting these tools in a toolbox that other files can borrow from
module.exports = { 
  pool,           // The connection pool that other files will use
  testConnection  // The function to test if the database is working
};
