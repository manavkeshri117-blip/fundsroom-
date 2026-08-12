const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { required } = require("../utils/validators");

const router = express.Router();

router.post("/login", async (req, res) => {
  required(req.body.email, "Email");
  required(req.body.password, "Password");

  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
