const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const Store = require("../models/Store");
const User = require("../models/User");

// @desc  Create a store and link it to an admin
// @route POST /api/stores
router.post("/", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const { name, address, phone, email, adminId } = req.body;

    // Verify admin exists
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Create store
    const store = await Store.create({
      name,
      address,
      phone,
      email,
      admin: adminId,
      createdBy: req.user.id,
    });

    // Link store to admin user
    await User.findByIdAndUpdate(adminId, { storeId: store._id });

    res.status(201).json({ success: true, message: "Store created", data: store });
  } catch (err) {
    console.error("CREATE STORE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to create store" });
  }
});

// @desc  Get all stores
// @route GET /api/stores
router.get("/", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: stores.length, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
});

// @desc  Get single store
// @route GET /api/stores/:id
router.get("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate("admin", "name email");
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch store" });
  }
});

// @desc  Update store
// @route PUT /api/stores/:id
router.put("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    res.json({ success: true, message: "Store updated", data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update store" });
  }
});

module.exports = router;