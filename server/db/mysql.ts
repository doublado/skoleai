import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables to securely configure database connection
config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

export default pool;