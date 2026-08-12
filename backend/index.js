require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const inventoryRoutes = require("./routes/inventory");
const challanRoutes = require("./routes/challans");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ success: true, message: "FundsRoom Operations API is running" }));
app.get("/health", (req, res) => res.json({ success: true, status: "healthy" }));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
});

const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fundsroom";

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB (${mongoUri.includes("127.0.0.1") ? "Local" : "Atlas Cloud"})`);
    app.listen(PORT, () => console.log(`FundsRoom API running on http://localhost:${PORT}`));
  })
  .catch(async (error) => {
    console.error("MongoDB connection failed:", error.message);
    if (error.message.includes("SSL alert number 80") || error.message.includes("ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR") || error.name === "MongooseServerSelectionError") {
      console.warn("\n⚠️  [MongoDB Atlas IP Access Notice]:");
      console.warn("MongoDB Atlas rejected the TLS handshake (SSL Alert 80).");
      console.warn("This occurs when your public IP is NOT whitelisted in MongoDB Atlas Security Settings.");
      console.warn("👉 Fix: Add your IP to Atlas Network Access at https://cloud.mongodb.com/");
      console.warn("👉 Or switch MONGO_URL in backend/.env to: mongodb://127.0.0.1:27017/fundsroom\n");
    }
    process.exit(1);
  });

