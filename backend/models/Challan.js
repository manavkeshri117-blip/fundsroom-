const mongoose = require("mongoose");

const challanItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const challanSchema = new mongoose.Schema({
  challanNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: { type: [challanItemSchema], validate: v => v.length > 0 },
  totalQuantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["Draft", "Confirmed", "Cancelled"], default: "Draft" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Challan", challanSchema);
