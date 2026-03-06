const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    /* ================= VEHICLE DETAILS ================= */
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "van", "truck", "other"],
      default: "bike",
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },
    /* ================= META ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);