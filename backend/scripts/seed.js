require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

async function seed() {
  const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fundsroom";
  await mongoose.connect(mongoUri);
  await Promise.all([User.deleteMany({}), Customer.deleteMany({}), Product.deleteMany({})]);

  const passwordHash = await bcrypt.hash("FundsRoom@123", 10);
  await User.insertMany([
    { name: "Admin User", email: "admin@fundsroom.local", passwordHash, role: "ADMIN" },
    { name: "Sales User", email: "sales@fundsroom.local", passwordHash, role: "SALES" },
    { name: "Warehouse User", email: "warehouse@fundsroom.local", passwordHash, role: "WAREHOUSE" },
    { name: "Accounts User", email: "accounts@fundsroom.local", passwordHash, role: "ACCOUNTS" }
  ]);

  await Customer.insertMany([
    { name: "Rahul Sharma", mobile: "9876543210", email: "rahul@example.com", businessName: "Sharma Traders", gstNumber: "29ABCDE1234F1Z5", customerType: "Wholesale", address: "Bengaluru, Karnataka", status: "Active", notes: "Regular wholesale customer" },
    { name: "Priya Mehta", mobile: "9876501234", email: "priya@example.com", businessName: "Mehta Retail", customerType: "Retail", address: "Mysuru, Karnataka", status: "Lead", notes: "Interested in monitors and accessories" }
  ]);

  await Product.insertMany([
    { name: "Wireless Keyboard", sku: "KB-WL-001", category: "Accessories", unitPrice: 1299, currentStock: 80, minimumStock: 20, warehouseLocation: "A-01" },
    { name: "Wireless Mouse", sku: "MS-WL-001", category: "Accessories", unitPrice: 799, currentStock: 45, minimumStock: 15, warehouseLocation: "A-02" },
    { name: "24-inch Monitor", sku: "MON-24-001", category: "Displays", unitPrice: 8999, currentStock: 12, minimumStock: 10, warehouseLocation: "B-01" },
    { name: "USB-C Hub", sku: "HUB-C-001", category: "Accessories", unitPrice: 1499, currentStock: 8, minimumStock: 10, warehouseLocation: "A-03" }
  ]);

  console.log("Seed completed.");
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
