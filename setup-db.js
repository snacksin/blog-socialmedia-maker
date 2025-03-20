const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { pool, testConnection, query } = require('./lib/db');

async function setupDatabase() {
  console.log('🔧 Starting database setup...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    // Test the connection using our centralized module
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to the database. Check your DATABASE_URL and network connection.');
      console.error(`📝 Current DATABASE_URL format: ${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}`);
      process.exit(1);
    }
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🔄 Executing schema.sql...');
    try {
      // We'll use our query function from the db module
      await query(sqlContent);
      console.log('✅ Database schema executed successfully!');
    } catch (schemaError) {
      console.error('❌ Error executing schema:', schemaError.message);
      if (schemaError.message.includes('already exists')) {
        console.log('⚠️ Some tables already exist, continuing...');
      } else {
        throw schemaError;
      }
    }
    
    // Insert a test user if it doesn't exist
    try {
      const testUserResult = await query(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      if (testUserResult.rows.length === 0) {
        console.log('🔄 Creating test user...');
        await query(
          'INSERT INTO users (email, name) VALUES ($1, $2)',
          ['test@example.com', 'Test User']
        );
        console.log('✅ Test user created!');
      } else {
        console.log('ℹ️ Test user already exists.');
      }
    } catch (userError) {
      console.error('❌ Error with test user:', userError.message);
      // Continue even if test user creation fails
    }
    
    // Close the pool
    await pool.end();
    
    console.log('✅ Database setup completed successfully!');
  } catch (err) {
    console.error('❌ Database setup error:');
    console.error('- Message:', err.message);
    console.error('- Code:', err.code);
    console.error('- Stack:', err.stack);
    
    if (err.code === 'ENOTFOUND') {
      console.error('🔍 The database host could not be found. Check your DATABASE_URL for typos.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('🔍 Connection refused. Check if the database server is running and accessible.');
    } else if (err.code === '28P01') {
      console.error('🔍 Authentication failed. Check your database username and password.');
    } else if (err.code === '3D000') {
      console.error('🔍 Database does not exist. You may need to create it first.');
    }
    
    process.exit(1);
  }
}

setupDatabase();
