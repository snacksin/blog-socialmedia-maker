// ES Module wrapper for the CommonJS database module
// This allows Next.js pages to import the database functions using ES module syntax

import db from './db.js';

// Re-export the components
export const pool = db.pool;
export const sql = db.sql;
export const query = db.query;
export const testConnection = db.testConnection;

// Default export for convenience
export default db;