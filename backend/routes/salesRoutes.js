const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// =====================
// Make Sale (Admin & Staff)
// =====================
router.post("/add", verifyToken, async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({
      message: "Product and quantity required"
    });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Get product price & stock (LOCK ROW)
    const [rows] = await conn.query(
      "SELECT price, stock FROM products WHERE id = ? FOR UPDATE",
      [product_id]
    );

    if (rows.length === 0) {
      throw new Error("Product not found");
    }

    const price = rows[0].price;
    const stock = rows[0].stock;

    if (stock < quantity) {
      throw new Error("Not enough stock available");
    }

    const total = price * quantity;

    // 2️⃣ Save sale
    await conn.query(
      `
      INSERT INTO sales (product_id, quantity, total, sale_date)
      VALUES (?, ?, ?, NOW())
      `,
      [product_id, quantity, total]
    );

    // 3️⃣ Update stock (CORRECT COLUMN)
    await conn.query(
      "UPDATE products SET stock = stock - ? WHERE id = ?",
      [quantity, product_id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Sale completed successfully",
      total
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("SALE ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
