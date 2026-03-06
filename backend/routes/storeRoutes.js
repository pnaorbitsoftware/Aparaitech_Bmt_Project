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
    const { name, categories, address, phone, email, adminId } = req.body;

    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    const store = await Store.create({
      name, categories: categories || [], address, phone, email,
      admin: adminId, createdBy: req.user.id,
    });

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
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: stores.length, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
});

// @desc  Get current admin's own store (admin only)
// @route GET /api/stores/my-store
router.get("/my-store", verifyToken, allowRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("storeId");
    if (!user?.storeId) return res.json({ success: true, data: null });
    const store = await Store.findById(user.storeId).select("name categories");
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch store" });
  }
});


// @desc  Get single store with staff
// @route GET /api/stores/:id
router.get("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("admin", "name email mobile")
      .populate("createdBy", "name");
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    // Get staff for this store
    const staff = await User.find({ storeId: store._id, role: "staff" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { store, staff } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch store" });
  }
});

// @desc  Update store (including changing admin)
// @route PUT /api/stores/:id
router.put("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const { adminId, ...rest } = req.body;

    const currentStore = await Store.findById(req.params.id);
    if (!currentStore) return res.status(404).json({ success: false, message: "Store not found" });

    // Handle admin change
    if (adminId && adminId !== String(currentStore.admin)) {
      // Verify new admin exists
      const newAdmin = await User.findOne({ _id: adminId, role: "admin" });
      if (!newAdmin) return res.status(404).json({ success: false, message: "New admin not found" });

      // Remove storeId from old admin
      if (currentStore.admin) {
        await User.findByIdAndUpdate(currentStore.admin, { $unset: { storeId: "" } });
      }

      // Assign storeId to new admin
      await User.findByIdAndUpdate(adminId, { storeId: currentStore._id });
      rest.admin = adminId;
    }

    const store = await Store.findByIdAndUpdate(req.params.id, rest, {
      new: true, runValidators: true,
    }).populate("admin", "name email");

    res.json({ success: true, message: "Store updated", data: store });
  } catch (err) {
    console.error("UPDATE STORE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update store" });
  }
});

// @desc  Delete store permanently
// @route DELETE /api/stores/:id
router.delete("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    // Remove storeId from admin
    if (store.admin) {
      await User.findByIdAndUpdate(store.admin, { $unset: { storeId: "" } });
    }

    // Remove storeId from all staff
    await User.updateMany({ storeId: store._id }, { $unset: { storeId: "" } });

    await Store.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (err) {
    console.error("DELETE STORE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete store" });
  }
});

module.exports = router;