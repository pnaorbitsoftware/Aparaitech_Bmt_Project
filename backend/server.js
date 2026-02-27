const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs"); // Added for directory check
require("dotenv").config();

const app = express();
// Add this with other routes


// Mount with other routes


/* ======================
   CORS CONFIG
====================== */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());

/* ======================
   STATIC FILES
====================== */
// Serve invoices from the legacy folder (if any)
app.use("/invoices", express.static(path.join(__dirname, "invoices")));

// Serve generated PDF bills from public/bills
const billsDir = path.join(__dirname, "public", "bills");
if (!fs.existsSync(billsDir)) {
  fs.mkdirSync(billsDir, { recursive: true }); // Create directory if missing
}
app.use("/bills", express.static(billsDir));

/* ======================
   MongoDB CONNECTION FUNCTION
====================== */
const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    
    if (error.message.includes('bad auth')) {
      console.error('🔑 Authentication failed - check username/password');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('🌐 Network error - check cluster name in connection string');
    } else if (error.message.includes('timed out')) {
      console.error('⏰ Timeout - check IP whitelist in MongoDB Atlas');
    }
    
    process.exit(1);
  }
};

/* ======================
   START SERVER FUNCTION
====================== */
const startServer = async () => {
  try {
    await connectDB();
    
    // Import routes
    const authRoutes = require("./routes/authRoutes");
    const inventoryRoutes = require("./routes/inventoryRoutes");
    const salesRoutes = require("./routes/salesRoutes");
    const dashboardRoutes = require("./routes/dashboardRoutes");
    const billingRoutes = require("./routes/billingRoutes");
    const customerRoutes = require("./routes/customerRoutes");
    const vendorRoutes = require("./routes/vendorRoutes");
    const reportRoutes = require("./routes/reportRoutes");
    const categoryRoutes = require("./routes/categoryRoutes");
    const bulkUploadRoutes = require("./routes/bulkUploadRoutes");
    const offerRoutes = require("./routes/offerRoutes");
    const testRoutes = require("./routes/testRoutes");
    const userRoutes = require("./routes/userRoutes");

    // Mount routes
    app.use("/api/auth", authRoutes);
    app.use("/api/inventory", inventoryRoutes);
    app.use("/api/sales", salesRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/billing", billingRoutes);
    app.use("/api/customers", customerRoutes);
    app.use("/api/vendors", vendorRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/bulk-upload", bulkUploadRoutes);
    app.use("/api/offers", offerRoutes);
    app.use("/api/test", testRoutes);
    app.use("/api/users", userRoutes);

    /* ======================
       HEALTH CHECK
    ====================== */
    app.get("/", (req, res) => {
      res.send("✅ Store Management Backend Running");
    });

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date()
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();