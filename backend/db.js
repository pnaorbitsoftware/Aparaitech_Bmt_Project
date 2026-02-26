const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Priyanka@1109",
  database: "store_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* =========================
   DB CONNECTION CHECK
========================= */
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected Successfully");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  }
})();

module.exports = pool;
