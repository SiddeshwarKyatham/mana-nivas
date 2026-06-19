import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set in environment variables.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon Postgres connections
  }
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.stack);
  } else {
    console.log('Successfully connected to Neon Postgres database.');
    release();
  }
});

export default pool;
