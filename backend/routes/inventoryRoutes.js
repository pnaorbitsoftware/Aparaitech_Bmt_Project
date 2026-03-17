const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const inventoryController = require("../controllers/inventoryController");
const Product = require("../models/Product");
const upload = require("../middleware/uploadMiddleware");

/* =========================
   PUBLIC - no auth required
   GET /api/inventory/public
========================= */
router.get("/public", async (req, res) => {
  try {

    const { category, storeId, featured } = req.query;

    let query = { is_active: 1 };

    if (category) query.category = category;
    if (storeId) query.storeId = storeId;
    if (featured === "true") query.is_featured = true;

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("storeId", "name categories")
      .sort({ is_featured: -1, created_at: -1 })
      .limit(50);

    res.json(products.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      discount_price: p.discount_price ?? null,
      stock: Number(p.stock),
      is_featured: p.is_featured,
      storeId: p.storeId,

      // ⭐ IMPORTANT
      image: p.image || null
    })));

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


/* =========================
   IMAGE UPLOAD
========================= */
router.post(
  "/upload-image",
  authMiddleware,
  allowRoles(["admin","super_admin"]),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image" });

    res.json({
      success: true,
      imageUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });
  }
);


/* =========================
   GET ALL PRODUCTS
========================= */
router.get(
  "/",
  authMiddleware,
  allowRoles(["admin", "staff", "super_admin"]),
  inventoryController.getAllProducts
);


/* =========================
   GET SINGLE PRODUCT
========================= */
router.get(
  "/:id",
  authMiddleware,
  allowRoles(["admin", "staff", "super_admin"]),
  inventoryController.getProductById
);


/* =========================
   ADD PRODUCT
========================= */
router.post(
  "/",
  authMiddleware,
  allowRoles(["admin", "super_admin"]),
  upload.single("image"),
  inventoryController.addProduct
);


/* =========================
   UPDATE PRODUCT
========================= */
router.put(
  "/:id",
  authMiddleware,
  allowRoles(["admin", "super_admin"]),
  inventoryController.updateProduct
);


/* =========================
   ARCHIVE PRODUCT
========================= */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles(["admin", "super_admin"]),
  inventoryController.archiveProduct
);

module.exports = router;