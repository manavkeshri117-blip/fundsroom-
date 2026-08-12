const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  businessName: { type: String, required: true, trim: true },
  gstNumber: { type: String, trim: true },
  customerType: { type: String, enum: ["Retail", "Wholesale", "Distributor"], required: true },
  address: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Lead", "Active", "Inactive"], default: "Lead" },
  followUpDate: Date,
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customer", customerSchema);
