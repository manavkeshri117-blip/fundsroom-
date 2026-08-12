const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");
const { required } = require("../utils/validators");

const router = express.Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", async (req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

router.post("/", async (req, res) => {
  required(req.body.name, "Name"); required(req.body.email, "Email"); required(req.body.password, "Password"); required(req.body.role, "Role");
  if (!["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"].includes(req.body.role)) return res.status(400).json({ success: false, message: "Invalid role" });
  const exists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (exists) return res.status(409).json({ success: false, message: "Email already exists" });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash, role: req.body.role });
  res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
