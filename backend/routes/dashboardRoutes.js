const express = require("express");
const router = express.Router();
const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

/* ==============================
   Dashboard Main Stats
   (ADMIN + STAFF)
============================== */
router.get(
  "/stats",
  verifyToken,
  allowRole(["admin", "staff"]), // ✅ FIXED
  async (req, res) => {
    try {
      const [[stats]] = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM products) AS totalProducts,
          (SELECT IFNULL(SUM(stock),0) FROM products) AS totalStock,
          (SELECT IFNULL(SUM(total),0) FROM transactions WHERE status='SUCCESS') AS totalRevenue,
          (SELECT COUNT(*) FROM transactions WHERE DATE(created_at)=CURDATE()) AS todaySales,
          (SELECT IFNULL(SUM(total),0) FROM transactions WHERE DATE(created_at)=CURDATE()) AS todayRevenue
      `);

      res.json({ success: true, stats });
    } catch (err) {
      console.error("DASHBOARD STATS ERROR:", err);
      res.status(500).json({ message: "Failed to load dashboard stats" });
    }
  }
);

/* ==============================
   Weekly Revenue
   (ADMIN + STAFF)
============================== */
router.get(
  "/weekly-revenue",
  verifyToken,
  allowRole(["admin", "staff"]), // ✅ FIXED
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT
  DATE(created_at) AS day,
  SUM(total) AS revenue
FROM transactions
WHERE status = 'SUCCESS'
  AND created_at >= DATE_SUB(UTC_DATE(), INTERVAL 6 DAY)
GROUP BY DATE(created_at)
ORDER BY day ASC;

      `);

      res.json(rows);
    } catch (err) {
      console.error("WEEKLY REVENUE ERROR:", err);
      res.status(500).json({ message: "Failed to load weekly revenue" });
    }
  }
);

/* ==============================
   Payment Preference
   (ADMIN + STAFF)
============================== */
router.get(
  "/payment-chart",
  verifyToken,
  allowRole(["admin", "staff"]), // ✅ FIXED
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT payment_mode, COUNT(*) AS count
        FROM transactions
        GROUP BY payment_mode
      `);

      res.json(rows);
    } catch (err) {
      console.error("PAYMENT CHART ERROR:", err);
      res.status(500).json({ message: "Failed to load payment chart" });
    }
  }
);

/* ==============================
   Recent Transactions
   (ADMIN + STAFF)
============================== */
router.get(
  "/recent-transactions",
  verifyToken,
  allowRole(["admin", "staff"]), // ✅ FIXED
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT bill_no, total, payment_mode, created_at
        FROM transactions
        ORDER BY created_at DESC
        LIMIT 5
      `);

      res.json(rows);
    } catch (err) {
      console.error("RECENT TX ERROR:", err);
      res.status(500).json({ message: "Failed to load recent transactions" });
    }
  }
);
/* ==============================
   LOW STOCK ALERTS
   (ADMIN + STAFF)
============================== */
router.get(
  "/low-stock",
  verifyToken,
  allowRole(["admin", "staff"]),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT id, name, sku, stock
        FROM products
        WHERE is_active = 1 AND stock <= 5
        ORDER BY stock ASC
      `);

      res.json({
        count: rows.length,
        items: rows
      });
    } catch (err) {
      console.error("LOW STOCK ERROR:", err);
      res.status(500).json({ message: "Failed to fetch low stock" });
    }
  }
);

module.exports = router;
