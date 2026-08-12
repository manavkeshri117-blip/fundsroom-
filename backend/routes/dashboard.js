const express = require("express");
const { authenticate } = require("../middleware/auth");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Challan = require("../models/Challan");
const StockMovement = require("../models/StockMovement");

const router = express.Router();
router.use(authenticate);

router.get("/summary", async (req, res) => {
  const [customers, products, pendingChallans, confirmedChallans, lowStock, movements] = await Promise.all([
    Customer.countDocuments(),
    Product.countDocuments(),
    Challan.countDocuments({ status: "Draft" }),
    Challan.countDocuments({ status: "Confirmed" }),
    Product.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
    StockMovement.countDocuments()
  ]);
  res.json({ success: true, data: { customers, products, pendingChallans, confirmedChallans, lowStock, movements } });
});

module.exports = router;
