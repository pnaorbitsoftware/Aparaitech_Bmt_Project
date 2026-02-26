const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


/* ======================
   CORS CONFIG (FINAL – MANUAL)
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
   (PDF INVOICES)
====================== */
app.use(
  "/invoices",
  express.static(path.join(__dirname, "invoices"))
);

/* ======================
   ROUTES
====================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/bulk-upload", require("./routes/bulkUploadRoutes"));

/* 🔥 EXTRA ROUTES */
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/test", require("./routes/testRoutes"));

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.send("✅ Store Management Backend Running");
});

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});