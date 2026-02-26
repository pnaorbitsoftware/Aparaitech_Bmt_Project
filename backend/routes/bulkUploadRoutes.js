const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../db");

// Upload config
const upload = multer({ dest: "uploads/" });

/* ======================================
   BULK INVENTORY UPLOAD (CSV)
====================================== */
router.post("/inventory", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }

  const results = [];
  let inserted = 0;
  let failed = 0;
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Read CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Insert rows
    for (const row of results) {
      const { name, sku, category, price, stock, expiry } = row;

      if (!name || !sku || !price || !stock) {
        failed++;
        continue;
      }

      try {
        await conn.query(
          `
          INSERT INTO products (name, sku, category, price, stock, expiry)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            name,
            sku,
            category || null,
            Number(price),
            Number(stock),
            expiry || null
          ]
        );

        inserted++;
      } catch (err) {
        failed++;
      }
    }

    await conn.commit();

    res.json({
      success: true,
      inserted,
      failed
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ BULK UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });

  } finally {
    if (conn) conn.release();
    fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
