const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const DeliveryPartner = require("../models/DeliveryPartner");

// @desc  Get all delivery partners
// @route GET /api/delivery-partners
router.get("/", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json({ success: true, count: partners.length, data: partners });
  } catch (err) {
    console.error("GET DELIVERY PARTNERS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch delivery partners" });
  }
});

// @desc  Create delivery partner
// @route POST /api/delivery-partners
router.post("/", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const { name, phone, email, vehicleType, vehicleNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const partner = await DeliveryPartner.create({
      name, phone, email, vehicleType, vehicleNumber,
      createdBy: req.user.id,
      isActive: true,
    });

    res.status(201).json({ success: true, message: "Delivery partner created", data: partner });
  } catch (err) {
    console.error("CREATE DELIVERY PARTNER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to create delivery partner" });
  }
});

// @desc  Update delivery partner
// @route PUT /api/delivery-partners/:id
router.put("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
    res.json({ success: true, message: "Partner updated", data: partner });
  } catch (err) {
    console.error("UPDATE DELIVERY PARTNER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update delivery partner" });
  }
});

// @desc  Delete delivery partner
// @route DELETE /api/delivery-partners/:id
router.delete("/:id", verifyToken, allowRole(["super_admin"]), async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
    res.json({ success: true, message: "Partner deleted" });
  } catch (err) {
    console.error("DELETE DELIVERY PARTNER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete delivery partner" });
  }
});

module.exports = router;