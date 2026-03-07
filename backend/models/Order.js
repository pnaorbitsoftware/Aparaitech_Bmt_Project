const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],

  itemsTotal: Number,
  deliveryCharge: Number,
  gst: Number,
  totalAmount: Number,

  status: {
    type: String,
    default: "Placed"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);