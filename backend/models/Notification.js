const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientType: {
    type: String,
    enum: ["user", "store", "delivery", "admin"],
    required: true,
    index: true,
  },
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["order", "payment", "status", "booking", "system"],
    default: "system",
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipientType: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
