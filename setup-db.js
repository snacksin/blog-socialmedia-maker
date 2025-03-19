const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  // Create a new client
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some PostgreSQL providers
    }
  });

  try {
    console.log('🔄 Testing connection to database...');
    
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🔄 Executing schema.sql...');
    await client.query(sql);
    console.log('✅ Database schema executed successfully!');
    
    // Close the client connection
    client.release();
    
    // Insert a test user if it doesn't exist
    const testUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['test@example.com']
    );
    
    if (testUser.rows.length === 0) {
      console.log('🔄 Creating test user...');
      await pool.query(
        'INSERT INTO users (email, name) VALUES ($1, $2)',
        ['test@example.com', 'Test User']
      );
      console.log('✅ Test user created!');
    } else {
      console.log('ℹ️ Test user already exists.');
    }
    
    // Close the pool
    await pool.end();
    
    console.log('✅ Database setup completed successfully!');
  } catch (err) {
    console.error('❌ Database setup error:', err);
    process.exit(1);
  }
}

setupDatabase();
