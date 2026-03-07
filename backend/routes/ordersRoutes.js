const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/* PLACE ORDER */

router.post("/place", async (req, res) => {

  try {

    console.log("ORDER RECEIVED:", req.body);

    const order = new Order(req.body);

    await order.save();

    res.json({
      success: true,
      message: "Order placed successfully"
    });

  } catch (err) {

    console.error("ORDER ERROR:", err);

    res.status(500).json({
      error: err.message
    });

  }

});
/* GET USER ORDERS */

router.get("/user/:userId", async (req, res) => {

  try {

    const orders = await Order.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


/* GET ALL ORDERS (SUPER ADMIN) */

router.get("/all", async (req, res) => {

  try {

    const orders = await Order.find()
      .populate("userId", "name mobile email");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

module.exports = router;