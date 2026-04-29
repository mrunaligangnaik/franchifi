const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  razorpayPaymentId: String,
  amount: Number,
  status: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
