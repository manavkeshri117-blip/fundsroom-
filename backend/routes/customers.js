const express = require("express");
const Customer = require("../models/Customer");
const FollowUp = require("../models/FollowUp");
const { authenticate, authorize } = require("../middleware/auth");
const { required } = require("../utils/validators");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const search = String(req.query.search || "").trim();
  const filter = search ? { $or: [
    { name: { $regex: search, $options: "i" } },
    { businessName: { $regex: search, $options: "i" } },
    { mobile: { $regex: search, $options: "i" } }
  ] } : {};
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.post("/", authorize("ADMIN", "SALES"), async (req, res) => {
  ["name", "mobile", "businessName", "customerType", "address"].forEach((field) => required(req.body[field], field));
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  const followUps = await FollowUp.find({ customer: customer._id }).populate("createdBy", "name role").sort({ followUpDate: -1 });
  res.json({ success: true, data: { customer, followUps } });
});

router.put("/:id", authorize("ADMIN", "SALES"), async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  res.json({ success: true, data: customer });
});

router.delete("/:id", authorize("ADMIN"), async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  await FollowUp.deleteMany({ customer: customer._id });
  res.json({ success: true, message: "Customer deleted" });
});

router.post("/:id/followups", authorize("ADMIN", "SALES"), async (req, res) => {
  required(req.body.note, "Note");
  required(req.body.followUpDate, "Follow-up date");
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  const followUp = await FollowUp.create({ customer: customer._id, note: req.body.note, followUpDate: req.body.followUpDate, createdBy: req.user.id });
  customer.followUpDate = req.body.followUpDate;
  customer.updatedAt = new Date();
  await customer.save();
  res.status(201).json({ success: true, data: followUp });
});

module.exports = router;
