const Product = require("../models/Product");

/* =========================
   GET ALL ACTIVE PRODUCTS
   (with expiry status calculation)
========================= */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ is_active: 1 }).sort({ created_at: -1 });

    // Calculate expiry status and discount for each product
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const normalized = products.map(p => {
      let expiryStatus = 'SAFE';
      let discountPercent = 0;

      if (p.expiry_date) {
        const expiryDate = new Date(p.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          expiryStatus = 'EXPIRED';
        } else if (expiryDate <= sevenDaysLater) {
          expiryStatus = 'NEAR_EXPIRY';
          discountPercent = 15;
        }
      }

      return {
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        expiryDate: p.expiry_date,
        expiryStatus,
        discountPercent
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error("FETCH INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      is_active: 1
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      expiryDate: product.expiry_date
    });
  } catch (err) {
    console.error("FETCH PRODUCT ERROR:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* =========================
   ADD PRODUCT (ADMIN)
========================= */
exports.addProduct = async (req, res) => {
  const { name, sku, category, price, stock, expiryDate } = req.body;

  if (!name || !sku || !category || price == null || stock == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ 
        message: "Product with this SKU already exists" 
      });
    }

    const newProduct = await Product.create({
      name,
      sku,
      category,
      price: Number(price),
      stock: Number(stock),
      expiry_date: expiryDate || null,
      is_active: 1
    });

    res.json({ 
      success: true, 
      id: newProduct._id 
    });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to add product" });
  }
};

/* =========================
   UPDATE PRODUCT (ADMIN)
========================= */
exports.updateProduct = async (req, res) => {
  const { name, sku, category, price, stock, expiryDate } = req.body;

  try {
    // Check if SKU exists for another product
    if (sku) {
      const existingProduct = await Product.findOne({ 
        sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({ 
          message: "SKU already exists for another product" 
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        sku,
        category,
        price: Number(price),
        stock: Number(stock),
        expiry_date: expiryDate || null
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
};

/* =========================
   ARCHIVE PRODUCT (ADMIN)
========================= */
exports.archiveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { is_active: 0 },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("ARCHIVE PRODUCT ERROR:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Failed to archive product" });
  }
};