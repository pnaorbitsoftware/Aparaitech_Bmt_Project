const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const recipientFor = (user) => ({
  recipientId: user.id,
  recipientType: user.role === "delivery_partner"
    ? "delivery"
    : user.role === "super_admin" ? "admin" : user.role === "admin" || user.role === "staff" ? "store" : "user",
});

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const recipient = recipientFor(req.user);
    const notifications = await Notification.find(recipient).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ ...recipient, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) { next(error); }
});

router.patch("/read-all", verifyToken, async (req, res, next) => {
  try {
    await Notification.updateMany({ ...recipientFor(req.user), read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.patch("/:id/read", verifyToken, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification id" });
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...recipientFor(req.user) },
      { read: true, readAt: new Date() },
      { returnDocument: "after" }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ success: true, notification });
  } catch (error) { next(error); }
});

module.exports = router;
