const express = require("express");
const router = express.Router();
const db = require("../db");

/* ======================================
   GET ALL CATEGORIES
====================================== */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY name"
    );

    res.json(rows);
  } catch (err) {
    console.error("CATEGORY FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

module.exports = router;
