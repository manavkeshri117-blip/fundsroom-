const express = require("express");
const mongoose = require("mongoose");
const Challan = require("../models/Challan");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const { authenticate, authorize } = require("../middleware/auth");
const { required, positiveNumber } = require("../utils/validators");

const router = express.Router();
router.use(authenticate);

async function generateNumber() {
  const count = await Challan.countDocuments();
  return `CH-${String(count + 1).padStart(5, "0")}`;
}

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const items = await Challan.find(filter).populate("customer", "name businessName mobile").populate("createdBy", "name role").sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

router.get("/:id", async (req, res) => {
  const challan = await Challan.findById(req.params.id).populate("customer").populate("createdBy", "name role");
  if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
  res.json({ success: true, data: challan });
});

router.post("/", authorize("ADMIN", "SALES"), async (req, res) => {
  required(req.body.customerId, "Customer");
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) return res.status(400).json({ success: false, message: "At least one product is required" });
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

  const items = [];
  let totalQuantity = 0;
  for (const item of req.body.items) {
    required(item.productId, "Product");
    positiveNumber(item.quantity, "Quantity");
    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
    const quantity = Number(item.quantity);
    items.push({ product: product._id, productName: product.name, sku: product.sku, unitPrice: product.unitPrice, quantity });
    totalQuantity += quantity;
  }

  const challan = await Challan.create({ challanNumber: await generateNumber(), customer: customer._id, items, totalQuantity, status: "Draft", createdBy: req.user.id });
  res.status(201).json({ success: true, data: challan });
});

router.post("/:id/confirm", authorize("ADMIN", "SALES"), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const challan = await Challan.findById(req.params.id).session(session);
    if (!challan) { await session.abortTransaction(); return res.status(404).json({ success: false, message: "Challan not found" }); }
    if (challan.status !== "Draft") { await session.abortTransaction(); return res.status(400).json({ success: false, message: "Only draft challans can be confirmed" }); }

    for (const item of challan.items) {
      const product = await Product.findOneAndUpdate({ _id: item.product, currentStock: { $gte: item.quantity } }, { $inc: { currentStock: -item.quantity }, $set: { updatedAt: new Date() } }, { new: true, session });
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.productName}` });
      }
      await StockMovement.create([{ product: product._id, quantity: item.quantity, movementType: "OUT", reason: `Sales challan ${challan.challanNumber}`, createdBy: req.user.id }], { session });
    }

    challan.status = "Confirmed";
    challan.updatedAt = new Date();
    await challan.save({ session });
    await session.commitTransaction();
    res.json({ success: true, message: "Challan confirmed and stock updated", data: challan });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

router.post("/:id/cancel", authorize("ADMIN", "SALES"), async (req, res) => {
  const challan = await Challan.findById(req.params.id);
  if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
  if (challan.status !== "Draft") return res.status(400).json({ success: false, message: "Only draft challans can be cancelled" });
  challan.status = "Cancelled";
  challan.updatedAt = new Date();
  await challan.save();
  res.json({ success: true, data: challan });
});

module.exports = router;
