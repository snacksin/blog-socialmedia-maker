// Centralized database connection module - using CommonJS syntax
const { Pool } = require('pg');
const { createClient } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

// For debugging - track if we've successfully connected
let hasConnected = false;

// Create and configure the PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some PostgreSQL providers like Neon
  }
});

// Initialize the Vercel PostgreSQL client - try both methods for compatibility
let vercelClient;
try {
  // In newer versions, we need to use createPool for pooler connection strings
  const { createPool } = require('@vercel/postgres');
  vercelClient = createPool({
    connectionString: process.env.DATABASE_URL,
  });
  console.log('Created Vercel Postgres pool');
} catch (error) {
  try {
    // Fall back to createClient for older versions or direct connections
    const { createClient } = require('@vercel/postgres');
    vercelClient = createClient({
      connectionString: process.env.DATABASE_URL,
    });
    console.log('Created Vercel Postgres client');
  } catch (fallbackError) {
    console.error('⚠️ Failed to initialize Vercel Postgres:', fallbackError.message);
    // Create a dummy implementation for the vercelClient that logs errors but doesn't crash
    vercelClient = {
      query: async (...args) => {
        console.error('⚠️ Vercel Postgres client not available, using pg fallback');
        // Use the regular pg pool as fallback
        return await query(...args);
      }
    };
  }
}

// Test database connection and log the result
async function testConnection() {
  console.log('⏳ Testing database connection...');
  console.log(`📝 Using connection string: ${maskConnectionString(process.env.DATABASE_URL)}`);
  
  // Test pg connection
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to database using pg.Pool!');
    client.release();
    hasConnected = true;
    
    // Additional database information
    try {
      const infoResult = await client.query('SELECT current_database() as db, current_user as user, version()');
      if (infoResult.rows.length > 0) {
        const { db, user, version } = infoResult.rows[0];
        console.log(`📊 Connected to database: ${db}`);
        console.log(`👤 Connected as user: ${user}`);
        console.log(`📝 PostgreSQL version: ${version.split(' ').slice(0, 2).join(' ')}`);
      }
    } catch (infoError) {
      console.log('⚠️ Could not retrieve additional database information');
    }
    
    // Test Vercel connection if it's a real client (not our fallback)
    if (vercelClient.query && !vercelClient.query.toString().includes('fallback')) {
      try {
        // Use a specific format for Vercel client
        const vercelResult = await vercelClient.query({
          text: 'SELECT NOW() as time'
        });
        if (vercelResult && vercelResult.rows && vercelResult.rows.length > 0) {
          console.log('✅ Successfully connected to database using @vercel/postgres!');
          console.log(`⌚ Server time: ${vercelResult.rows[0].time}`);
        }
      } catch (vercelError) {
        console.error('⚠️ @vercel/postgres connection failed:', vercelError.message);
        console.log('⚠️ This is okay if you are not using Vercel deployment');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('🔍 Full error details:');
    console.error(`- Code: ${error.code || 'N/A'}`);
    console.error(`- Error Type: ${error.constructor.name}`);
    
    // Provide more specific error guidance
    if (error.code === 'ENOTFOUND') {
      console.error('🔍 The database host could not be found. Check your DATABASE_URL for typos.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Connection refused. Check if the database server is running and accessible.');
    } else if (error.code === '28P01') {
      console.error('🔍 Authentication failed. Check your database username and password.');
    } else if (error.code === '3D000') {
      console.error('🔍 Database does not exist. You may need to create it first.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🔍 Connection timeout. Check network connectivity or firewall settings.');
    }
    
    return false;
  }
}

// Execute a query using pg Pool - more flexible for complex operations
async function query(text, params) {
  if (!hasConnected) {
    await testConnection();
  }
  
  try {
    console.log(`⏳ Executing query: ${text}`);
    const client = await pool.connect();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      console.log(`✅ Query completed in ${duration}ms with ${result.rowCount} rows`);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`❌ Query failed: ${text}`, error);
    throw error;
  }
}

// Helper to mask sensitive info in connection string
function maskConnectionString(connectionString) {
  if (!connectionString) return 'undefined';
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.username}:****@${url.host}${url.pathname}`;
  } catch (e) {
    return 'invalid-connection-string';
  }
}

// Export everything for CommonJS modules
module.exports = {
  pool,
  sql: vercelClient,
  query,
  testConnection
};