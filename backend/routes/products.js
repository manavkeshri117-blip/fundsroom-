const express = require("express");
const Product = require("../models/Product");
const { authenticate, authorize } = require("../middleware/auth");
const { required, positiveNumber } = require("../utils/validators");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { sku: { $regex: req.query.search, $options: "i" } }];
  if (req.query.category) filter.category = req.query.category;
  const items = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

router.post("/", authorize("ADMIN", "WAREHOUSE"), async (req, res) => {
  ["name", "sku", "category", "unitPrice", "minimumStock", "warehouseLocation"].forEach((field) => required(req.body[field], field));
  if (Number(req.body.unitPrice) < 0 || Number(req.body.minimumStock) < 0 || Number(req.body.currentStock || 0) < 0) {
    return res.status(400).json({ success: false, message: "Stock and price cannot be negative" });
  }
  const product = await Product.create({ ...req.body, currentStock: Number(req.body.currentStock || 0), unitPrice: Number(req.body.unitPrice), minimumStock: Number(req.body.minimumStock) });
  res.status(201).json({ success: true, data: product });
});

router.put("/:id", authorize("ADMIN", "WAREHOUSE"), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: product });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: product });
});

module.exports = router;
