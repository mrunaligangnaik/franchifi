const express = require("express");
const Razorpay = require("razorpay");
const Application = require("../models/Application");
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const mongoose = require("mongoose");
const applicationController = require("../controllers/applicationController");

const router = express.Router();

router.get("/my", auth(), applicationController.getMyApplications);
router.get("/my-applications", auth(), applicationController.getMyApplications);

router.post("/create", auth(), async (req, res) => {
  try {
    const { franchiseId } = req.body;

    const existingApp = await Application.findOne({
      investor: req.user.id,
      franchiseId: franchiseId,
      status: { $in: ["draft", "pending", "submitted"] },
    });

    if (existingApp) {
      return res.status(400).json({
        message: "You already have an active application for this franchise",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const application = await Application.create({
      investor: req.user.id,
      paymentStatus: "pending",
      status: "draft",
      ...req.body,
    });

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

    application.razorpayOrderId = order.id;
    await application.save();

    res.json({
      applicationId: application._id,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create application" });
  }
});

router.post("/:id/submit", auth(), applicationController.submitApplication);

router.post(
  "/:id/ask-rejection-reason",
  auth(),
  applicationController.askRejectionReason
);

router.put(
  "/:id/status",
  auth(),
  roleMiddleware(["franchisor", "admin"]),
  applicationController.updateApplicationStatus
);

router.get("/:id", auth(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.investor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(application);
  } catch (err) {
    console.error("Get Application Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;