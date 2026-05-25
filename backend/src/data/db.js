const { Pool } = require('pg');

// Use Render's DATABASE_URL or local fallback for testing
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Render Postgres
  },
});

module.exports = pool;
