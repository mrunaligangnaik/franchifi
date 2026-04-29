const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["investor", "Franchisor", "admin"],
      default: "investor",
    },

    phone: { type: String, default: null },
    address: { type: String, default: null },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },

    birthday: {
      type: Date,
      default: null,
    },

    avatar: { type: String, default: "" },

    // ✅ ADDED — User account status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
