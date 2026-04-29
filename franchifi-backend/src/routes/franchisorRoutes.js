const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Franchise = require("../models/Franchise");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

// ✅ GET FRANCHISOR STATS
router.get("/stats", auth(), async (req, res) => {
  try {
    if (req.user.role !== "Franchisor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const franchises = await Franchise.find({ owner: req.user.id });
    const franchiseIds = franchises.map((f) => f._id.toString());

    const applications = await Application.find({
      franchiseId: { $in: franchiseIds },
    });

    const stats = {
      totalApplications: applications.length,
      pendingReview: applications.filter(
        (a) => a.status === "pending" || a.status === "submitted"
      ).length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };

    res.json(stats);
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ✅ GET ALL APPLICATIONS FOR FRANCHISOR
router.get("/applications", auth(), async (req, res) => {
  try {
    if (req.user.role !== "Franchisor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const franchises = await Franchise.find({ owner: req.user.id });
    const franchiseIds = franchises.map((f) => f._id.toString());

    const applications = await Application.find({
      franchiseId: { $in: franchiseIds },
    })
      .populate("investor", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Applications Error:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// ✅ UPDATE APPLICATION STATUS — NOW WITH NOTIFICATION + SOCKET
router.patch("/applications/:id/status", auth(), async (req, res) => {
  try {
    if (req.user.role !== "Franchisor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, remarks } = req.body;

    if (!["approved", "rejected", "shortlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify franchisor owns this franchise
    const franchise = await Franchise.findById(application.franchiseId);
    if (!franchise || franchise.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ UPDATE APPLICATION
    application.status = status;
    application.remarks = remarks || "";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.id;
    await application.save();

    // ✅ BUILD NOTIFICATION MESSAGE
    let message = "";
    if (status === "approved") {
      message = `✅ Your application for "${application.franchiseName}" has been approved by the franchisor.`;
    } else if (status === "rejected") {
      message = `❌ Your application for "${application.franchiseName}" has been rejected.${
        remarks
          ? ` Reason: ${remarks}`
          : " You can ask the franchisor for more details."
      }`;
    } else if (status === "shortlisted") {
      message = `⭐ Your application for "${application.franchiseName}" has been shortlisted by the franchisor.`;
    }

    // ✅ SAVE NOTIFICATION TO MONGODB
    const notification = await Notification.create({
      user: application.investor,
      message,
      type: "status_update",
      applicationId: application._id,
      read: false,
    });

    console.log("✅ Notification saved to MongoDB:", notification._id);

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
    } else {
      console.warn("⚠️ Socket.io not found on app — check app.set('io', io) in index.js");
    }

    res.json({ message: "Status updated", application });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ✅ NEW: FRANCHISOR REPLIES TO INVESTOR QUERY
// Investor asked "why was I rejected?" → Franchisor types reply here
// → saves reply on application → investor gets real-time bell notification
router.post("/applications/:id/reply", auth(), async (req, res) => {
  try {
    if (req.user.role !== "Franchisor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify franchisor owns this franchise
    const franchise = await Franchise.findById(application.franchiseId);
    if (!franchise || franchise.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Save reply on application
    application.franchisorReply = reply;
    application.franchisorReplyAt = new Date();
    await application.save();

    // ✅ Create notification for investor in MongoDB
    const message = `💬 Reply from Franchisor about your "${application.franchiseName}" application: "${reply}"`;

    const notification = await Notification.create({
      user: application.investor,
      message,
      type: "franchisor_reply",
      applicationId: application._id,
      read: false,
    });

    console.log("✅ Reply notification saved:", notification._id);

    // ✅ Emit real-time socket event to investor
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
      console.log("📡 Reply socket emitted to investor:", application.investor.toString());
    }

    res.json({ success: true, message: "Reply sent to investor successfully." });
  } catch (err) {
    console.error("REPLY ERROR:", err);
    res.status(500).json({ message: "Failed to send reply" });
  }
});

module.exports = router;