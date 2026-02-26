const express = require("express");
const router = express.Router();
const db = require("../db");

const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

/* =========================
   🔍 CHECK CUSTOMER BY PHONE
   (USED BY BILLING — MAIN)
========================= */
router.get(
  "/check",
  verifyToken,
  allowRole(["admin", "staff"]),
  async (req, res) => {
    try {
      const { phone } = req.query;

      if (!phone) {
        return res.json({ exists: false });
      }

      const [[customer]] = await db.query(
        `
        SELECT
          id,
          name,
          phone,
          points,
          loyalty_id
        FROM customers
        WHERE phone = ?
        `,
        [phone]
      );

      if (!customer) {
        return res.json({ exists: false });
      }

      res.json({
        exists: true,
        customer
      });

    } catch (err) {
      console.error("CUSTOMER CHECK ERROR:", err);
      res.status(500).json({
        message: "Customer lookup failed"
      });
    }
  }
);

/* =========================
   GET ALL CUSTOMERS
   (ADMIN + STAFF)
========================= */
router.get(
  "/",
  verifyToken,
  allowRole(["admin", "staff"]),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          c.id,
          c.name,
          c.phone,
          c.points,
          c.loyalty_id,
          IFNULL(SUM(t.total), 0) AS lifetime_spent
        FROM customers c
        LEFT JOIN transactions t ON t.customer_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error("CUSTOMER FETCH ERROR:", err);
      res.status(500).json({
        message: "Failed to load customers"
      });
    }
  }
);

/* =========================
   ENROLL CUSTOMER
   (MANUAL / OPTIONAL)
========================= */
router.post(
  "/",
  verifyToken,
  allowRole(["admin", "staff"]),
  async (req, res) => {
    try {
      const { name, phone, email } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          message: "Name and phone are required"
        });
      }

      const loyaltyId = "LOY" + Date.now();

      const [result] = await db.query(
        `
        INSERT INTO customers
        (loyalty_id, name, phone, email, points, total_spent)
        VALUES (?, ?, ?, ?, 0, 0)
        `,
        [loyaltyId, name, phone, email || null]
      );

      res.json({
        success: true,
        id: result.insertId,
        loyalty_id: loyaltyId
      });

    } catch (err) {
      console.error("CUSTOMER ENROLL ERROR:", err);
      res.status(500).json({
        message: "Customer enrollment failed"
      });
    }
  }
);

/* =========================
   DELETE CUSTOMER (ADMIN)
========================= */
router.delete(
  "/:id",
  verifyToken,
  allowRole(["admin"]),
  async (req, res) => {
    try {
      await db.query(
        "DELETE FROM customers WHERE id = ?",
        [req.params.id]
      );

      res.json({ success: true });

    } catch (err) {
      res.status(400).json({
        message: "Customer cannot be deleted (linked to transactions)"
      });
    }
  }
);

module.exports = router;
