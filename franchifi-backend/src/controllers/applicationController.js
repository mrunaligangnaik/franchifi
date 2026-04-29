const Application = require("../models/Application");
const Razorpay = require("razorpay");
const Franchise = require("../models/Franchise");
const { createNotification } = require("./notificationController");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- CREATE APPLICATION --------------------
exports.createApplication = async (req, res) => {
  try {
    const {
      franchiseId,
      franchiseName,
      fullName,
      email,
      phone,
      city,
      investmentBudget,
      fundSource,
      hasBusinessExperience,
      experienceDescription,
      industryExperience,
      preferredLocation,
      hasSpace,
      spaceSize,
      startTimeline,
      followSOP,
      additionalInfo,
    } = req.body;

    const application = await Application.create({
      investor: req.user.id,
      franchiseId,
      franchiseName,
      fullName,
      email,
      phone,
      city,
      investmentBudget,
      industryExperience,
      experienceDescription,
      preferredLocation,
      startTimeline,
      additionalInfo,
      status: "draft",
      paymentStatus: "pending",
    });

    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: `app_${application._id}`,
    });

    application.razorpayOrderId = order.id;
    await application.save();

    res.json({
      success: true,
      applicationId: application._id,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("❌ Create Application Error:", err);
    res.status(500).json({ message: "Failed to create application" });
  }
};

// -------------------- GET MY APPLICATIONS --------------------
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      investor: req.user.id,
    }).sort({ createdAt: -1 });

    // ✅ CHECK WHICH FRANCHISES STILL EXIST IN DATABASE
    const franchiseIds = applications.map((app) => app.franchiseId);

    const existingFranchises = await Franchise.find({
      _id: { $in: franchiseIds },
    }).select("_id");

    const existingIds = new Set(
      existingFranchises.map((f) => f._id.toString())
    );

    // ✅ FILTER OUT DELETED FRANCHISES
    const filteredApplications = applications.filter((app) =>
      existingIds.has(app.franchiseId)
    );

    res.json(filteredApplications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// -------------------- GET APPLICATION BY ID --------------------
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      investor: req.user.id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

// -------------------- SUBMIT APPLICATION --------------------
exports.submitApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    application.status = "submitted";
    application.submittedAt = new Date();

    await application.save();

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submission failed" });
  }
};

// -------------------- UPDATE APPLICATION STATUS (FRANCHISOR / ADMIN) --------------------
exports.updateApplicationStatus = async (req, res) => {
  try {
    console.log("🔥 STATUS UPDATE TRIGGERED");

    const { status, remarks } = req.body;

    if (!["approved", "rejected", "shortlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.remarks = remarks || "";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    await application.save();

    let message = "";

    if (status === "approved") {
      message = `✅ Your application for "${application.franchiseName}" has been approved.`;
    } else if (status === "rejected") {
      message = `❌ Your application for "${application.franchiseName}" has been rejected.${
        remarks ? ` Reason: ${remarks}` : " You can ask the franchisor for more details."
      }`;
    } else if (status === "shortlisted") {
      message = `⭐ Your application for "${application.franchiseName}" has been shortlisted.`;
    }

    if (message) {
      const Notification = require("../models/Notification");

      const notification = await Notification.create({
        user: application.investor,
        message,
        type: "status_update",
        applicationId: application._id,
        read: false,
      });

      console.log("✅ Notification Created:", notification);

      // ✅ EMIT REAL-TIME SOCKET EVENT TO INVESTOR
      const io = req.app.get("io");
      if (io) {
        io.to(application.investor.toString()).emit("newNotification", {
          _id: notification._id,
          message: notification.message,
          type: notification.type,
          applicationId: notification.applicationId,
          read: false,
          createdAt: notification.createdAt,
        });
        console.log(
          "📡 Socket event emitted to investor:",
          application.investor.toString()
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// -------------------- INVESTOR ASKS WHY REJECTED --------------------
// Investor sends a query about their rejection → notifies Admin + Franchisor
exports.askRejectionReason = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ message: "Question cannot be empty" });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      investor: req.user.id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "rejected") {
      return res
        .status(400)
        .json({ message: "You can only ask about rejected applications" });
    }

    const Notification = require("../models/Notification");
    const User = require("../models/User");

    const investorUser = await User.findById(req.user.id).select("name");
    const investorName = investorUser ? investorUser.name : "An investor";

    const queryMessage = `💬 Investor Query: ${investorName} is asking about their rejected application for "${application.franchiseName}": "${question}"`;

    // ✅ NOTIFY ADMIN(S)
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const io = req.app.get("io");

    for (const admin of adminUsers) {
      const adminNotification = await Notification.create({
        user: admin._id,
        message: queryMessage,
        type: "investor_query",
        applicationId: application._id,
        read: false,
      });

      if (io) {
        io.to(admin._id.toString()).emit("newNotification", {
          _id: adminNotification._id,
          message: adminNotification.message,
          type: adminNotification.type,
          applicationId: adminNotification.applicationId,
          read: false,
          createdAt: adminNotification.createdAt,
        });
      }
    }

    // ✅ NOTIFY FRANCHISOR (reviewedBy field)
    if (application.reviewedBy) {
      const franchisorNotification = await Notification.create({
        user: application.reviewedBy,
        message: queryMessage,
        type: "investor_query",
        applicationId: application._id,
        read: false,
      });

      if (io) {
        io.to(application.reviewedBy.toString()).emit("newNotification", {
          _id: franchisorNotification._id,
          message: franchisorNotification.message,
          type: franchisorNotification.type,
          applicationId: franchisorNotification.applicationId,
          read: false,
          createdAt: franchisorNotification.createdAt,
        });
      }
    }

    // ✅ SAVE QUERY ON THE APPLICATION ITSELF
    application.investorQuery = question;
    application.investorQueryAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: "Your query has been sent to the franchisor and admin.",
    });
  } catch (err) {
    console.error("ASK REJECTION REASON ERROR:", err);
    res.status(500).json({ message: "Failed to send query" });
  }
};