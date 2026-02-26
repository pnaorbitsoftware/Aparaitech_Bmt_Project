const express = require("express");
const router = express.Router();
const db = require("../db");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

/* =========================
   GET ALL ACTIVE PRODUCTS
   (ADMIN + STAFF)
========================= */
router.get(
  "/",
  authMiddleware,
  allowRoles(["admin", "staff"]),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          name,
          sku,
          category,
          CAST(price AS DECIMAL(10,2)) AS price,
          CAST(stock AS SIGNED) AS stock,
          expiry_date,
          CASE
            WHEN expiry_date IS NULL THEN 'SAFE'
            WHEN expiry_date < CURDATE() THEN 'EXPIRED'
            WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
              THEN 'NEAR_EXPIRY'
            ELSE 'SAFE'
          END AS expiry_status,
          CASE
            WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
             AND expiry_date >= CURDATE()
              THEN 15
            ELSE 0
          END AS discount_percent
        FROM products
        WHERE is_active = 1
        ORDER BY id DESC
      `);

      // 🔒 normalize + frontend-friendly keys
      const normalized = rows.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        expiryDate: p.expiry_date,        // ✅ frontend expects this
        expiryStatus: p.expiry_status,
        discountPercent: p.discount_percent
      }));

      res.json(normalized);
    } catch (err) {
      console.error("FETCH INVENTORY ERROR:", err);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  }
);

/* =========================
   GET SINGLE PRODUCT
========================= */
router.get(
  "/:id",
  authMiddleware,
  allowRoles(["admin", "staff"]),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `
        SELECT
          id,
          name,
          sku,
          category,
          CAST(price AS DECIMAL(10,2)) AS price,
          CAST(stock AS SIGNED) AS stock,
          expiry_date
        FROM products
        WHERE id = ? AND is_active = 1
        `,
        [req.params.id]
      );

      if (!rows.length) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        ...rows[0],
        price: Number(rows[0].price),
        stock: Number(rows[0].stock),
        expiryDate: rows[0].expiry_date
      });
    } catch (err) {
      console.error("FETCH PRODUCT ERROR:", err);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  }
);

/* =========================
   ADD PRODUCT (ADMIN)
========================= */
router.post(
  "/",
  authMiddleware,
  allowRoles(["admin"]),
  async (req, res) => {
    const { name, sku, category, price, stock, expiryDate } = req.body;

    if (!name || !sku || !category || price == null || stock == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const [result] = await db.query(
        `
        INSERT INTO products
        (name, sku, category, price, stock, expiry_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        `,
        [
          name,
          sku,
          category,
          Number(price),
          Number(stock),
          expiryDate || null
        ]
      );

      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err);
      res.status(500).json({ message: "Failed to add product" });
    }
  }
);

/* =========================
   UPDATE PRODUCT (ADMIN)
========================= */
router.put(
  "/:id",
  authMiddleware,
  allowRoles(["admin"]),
  async (req, res) => {
    const { name, sku, category, price, stock, expiryDate } = req.body;

    try {
      await db.query(
        `
        UPDATE products SET
          name = ?,
          sku = ?,
          category = ?,
          price = ?,
          stock = ?,
          expiry_date = ?
        WHERE id = ?
        `,
        [
          name,
          sku,
          category,
          Number(price),
          Number(stock),
          expiryDate || null,
          req.params.id
        ]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("UPDATE PRODUCT ERROR:", err);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);

/* =========================
   ARCHIVE PRODUCT (ADMIN)
========================= */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles(["admin"]),
  async (req, res) => {
    try {
      await db.query(
        "UPDATE products SET is_active = 0 WHERE id = ?",
        [req.params.id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("ARCHIVE PRODUCT ERROR:", err);
      res.status(500).json({ message: "Failed to archive product" });
    }
  }
);

module.exports = router;
