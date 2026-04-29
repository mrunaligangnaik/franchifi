const crypto = require("crypto");
const Application = require("../models/Application");
const Razorpay = require("razorpay");

// ✅ Create order for pending payment
exports.createOrder = async (req, res) => {
  try {
    console.log("📥 Create Order Request Body:", req.body);
    console.log("👤 User from token:", req.user);
    
    const { applicationId } = req.body;

    if (!applicationId) {
      console.log("❌ No applicationId provided");
      return res.status(400).json({ message: "Application ID is required" });
    }

    console.log("🔍 Finding application:", applicationId);
    const application = await Application.findById(applicationId);
    
    if (!application) {
      console.log("❌ Application not found:", applicationId);
      return res.status(404).json({ message: "Application not found" });
    }

    console.log("✅ Application found:", application._id);
    console.log("💰 Payment status:", application.paymentStatus);

    if (application.paymentStatus === "paid") {
      console.log("⚠️ Payment already completed");
      return res.status(400).json({ message: "Payment already completed" });
    }

    console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "Present" : "Missing");
    console.log("🔑 Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing");

    // ✅ FIXED: Move inside function so env vars are loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("📝 Creating Razorpay order...");

    // ✅ FIXED: Inner try/catch so SDK crash is handled gracefully
    let order;
    try {
      order = await razorpay.orders.create({
        amount: 50000,
        currency: "INR",
        receipt: `app_${application._id}`,
      });
    } catch (razorpayErr) {
      console.error("❌ Razorpay SDK Error:", razorpayErr?.error || razorpayErr);
      return res.status(502).json({
        message: "Payment gateway error. Check your API keys and network.",
        detail: razorpayErr?.error?.description || razorpayErr?.message,
      });
    }

    console.log("✅ Razorpay order created:", order.id);

    application.razorpayOrderId = order.id;
    await application.save();

    console.log("✅ Order ID saved to application");

    res.json({
      success: true,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: "Failed to create payment order",
      error: err.message 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      applicationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.paymentStatus = "paid";
    application.status = "submitted";
    application.submittedAt = new Date();
    application.razorpayPaymentId = razorpay_payment_id;
    application.razorpayOrderId = razorpay_order_id;
    application.razorpaySignature = razorpay_signature;

    await application.save();

    res.json({
      success: true,
      paymentStatus: application.paymentStatus,
      applicationStatus: application.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};