const express = require("express");
const router = express.Router();
const db = require("../db");

/* ===============================
   GET ALL TRANSACTIONS (REPORTS)
================================ */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        t.id,
        t.bill_no        AS bill_number,
        IFNULL(c.name, 'Walk-in') AS customer_name,
        t.payment_mode,
        t.total,
        t.status         AS audit_status,
        t.created_at
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("REPORT FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
});

/* ===============================
   DASHBOARD / REPORT STATS
================================ */
router.get("/stats", async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS totalOrders,
        IFNULL(SUM(total), 0) AS totalRevenue
      FROM transactions
    `);

    res.json(stats);
  } catch (err) {
    console.error("REPORT STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

module.exports = router;
