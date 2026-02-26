const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");

const { createBill } = require("../controllers/billingController");
const db = require("../db");

/* ======================================
   GENERATE BILL
   (ADMIN + STAFF)
====================================== */
router.post(
  "/",
  verifyToken,
  allowRole(["admin", "staff"]),
  createBill
);

/* ======================================
   REFUND / CANCEL BILL
   (ADMIN ONLY)
====================================== */
router.post(
  "/:id/refund",
  verifyToken,
  allowRole(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    let conn;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      /* 🔒 Lock transaction */
      const [[tx]] = await conn.query(
        `
        SELECT status
        FROM transactions
        WHERE id = ?
        FOR UPDATE
        `,
        [id]
      );

      if (!tx) {
        throw new Error("Transaction not found");
      }

      if (tx.status !== "SUCCESS") {
        throw new Error("Bill already refunded or invalid");
      }

      /* 🔁 Reverse transaction */
      await conn.query(
        `
        UPDATE transactions
        SET status = 'REVERSED'
        WHERE id = ?
        `,
        [id]
      );

      /* ♻ Restore stock */
      const [items] = await conn.query(
        `
        SELECT product_id, quantity
        FROM transaction_items
        WHERE transaction_id = ?
        `,
        [id]
      );

      for (const item of items) {
        await conn.query(
          `
          UPDATE products
          SET stock = stock + ?
          WHERE id = ?
          `,
          [item.quantity, item.product_id]
        );

        await conn.query(
          `
          INSERT INTO stock_audit
          (product_id, change_qty, reason, reference)
          VALUES (?, ?, 'REFUND', ?)
          `,
          [item.product_id, item.quantity, `REFUND-${id}`]
        );
      }

      await conn.commit();

      res.json({
        success: true,
        message: "Bill refunded successfully"
      });

    } catch (err) {
      if (conn) await conn.rollback();
      console.error("❌ REFUND ERROR:", err);
      res.status(400).json({ message: err.message });
    } finally {
      if (conn) conn.release();
    }
  }
);
const { sendWhatsApp } = require("../utils/notificationService");

/* ======================================
   SEND BILL TO WHATSAPP (MANUAL RESEND)
====================================== */
router.post(
  "/send-whatsapp",
  verifyToken,
  allowRole(["admin", "staff"]),
  async (req, res) => {
    const { phone, billNo, total } = req.body;

    if (!phone || !billNo || !total) {
      return res.status(400).json({
        message: "Phone, bill number and total are required"
      });
    }

    try {
      const message = `
🧾 SmartStore Receipt

Bill No: ${billNo}
Total Amount: ₹${total}

Thank you for shopping with us!
Visit again 🙏
      `;

      await sendWhatsApp(`+91${phone}`, message);

      res.json({ success: true });
    } catch (err) {
      console.error("WHATSAPP SEND ERROR:", err);
      res.status(500).json({
        message: "Failed to send WhatsApp message"
      });
    }
  }
);

module.exports = router;
