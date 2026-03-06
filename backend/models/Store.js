const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: [true, "Please add a store name"],
      trim: true,
    },
    /* ================= CATEGORIES (multiple) ================= */
    categories: {
      type: [String],
      default: [],
    },
    address: {
      street: { type: String, trim: true },
      city:   { type: String, trim: true },
      state:  { type: String, trim: true },
      pincode:{ type: String, trim: true },
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    /* ================= RELATIONSHIPS ================= */
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);