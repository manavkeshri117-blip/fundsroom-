const express = require("express");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const { authenticate, authorize } = require("../middleware/auth");
const { required, positiveNumber } = require("../utils/validators");

const router = express.Router();
router.use(authenticate);

router.get("/movements", async (req, res) => {
  const items = await StockMovement.find().populate("product", "name sku").populate("createdBy", "name role").sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: items });
});

router.post("/stock-in", authorize("ADMIN", "WAREHOUSE"), async (req, res) => {
  required(req.body.productId, "Product");
  positiveNumber(req.body.quantity, "Quantity");
  required(req.body.reason, "Reason");
  const product = await Product.findByIdAndUpdate(req.body.productId, { $inc: { currentStock: Number(req.body.quantity) }, $set: { updatedAt: new Date() } }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  const movement = await StockMovement.create({ product: product._id, quantity: Number(req.body.quantity), movementType: "IN", reason: req.body.reason, createdBy: req.user.id });
  res.status(201).json({ success: true, data: { product, movement } });
});

router.post("/stock-out", authorize("ADMIN", "WAREHOUSE"), async (req, res) => {
  required(req.body.productId, "Product");
  positiveNumber(req.body.quantity, "Quantity");
  required(req.body.reason, "Reason");
  const quantity = Number(req.body.quantity);
  const product = await Product.findOneAndUpdate({ _id: req.body.productId, currentStock: { $gte: quantity } }, { $inc: { currentStock: -quantity }, $set: { updatedAt: new Date() } }, { new: true });
  if (!product) return res.status(400).json({ success: false, message: "Product not found or insufficient stock" });
  const movement = await StockMovement.create({ product: product._id, quantity, movementType: "OUT", reason: req.body.reason, createdBy: req.user.id });
  res.status(201).json({ success: true, data: { product, movement } });
});

module.exports = router;
