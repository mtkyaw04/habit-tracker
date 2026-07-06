const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || "habit_user",
  password: process.env.DB_PASSWORD || "habit_pass",
  database: process.env.DB_NAME || "habit_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool;
