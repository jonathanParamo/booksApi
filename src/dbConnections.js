import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.RAILWAY_MYSQLHOST,
  port: process.env.RAILWAY_PORT,
  user: process.env.RAILWAY_MYSQLUSER,
  password: process.env.RAILWAY_MYSQLPASSWORD,
  database: process.env.RAILWAY_MYSQLDATABASE,
}).promise();

export default pool;