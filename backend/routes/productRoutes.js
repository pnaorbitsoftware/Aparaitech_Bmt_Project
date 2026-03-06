const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {

    const products = await Product.find();

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET PRODUCTS BY CATEGORY
router.get("/category/:category", async (req, res) => {
  try {

    const category = req.params.category;

    const products = await Product.find({
      category: category
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ADD PRODUCT
router.post("/", async (req, res) => {
  try {

    const { name, price, category, image, description } = req.body;

    const newProduct = new Product({
      name,
      price,
      category,
      image,
      description
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;