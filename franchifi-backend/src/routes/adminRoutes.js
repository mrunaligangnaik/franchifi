const express = require("express");
const router = express.Router();

const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Franchise = require("../models/Franchise");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

/**
 * ADMIN DASHBOARD STATS
 */
router.get(
  "/stats",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalFranchises = await Franchise.countDocuments();
      const totalApplications = await Application.countDocuments();

      const pendingApplications = await Application.countDocuments({
        status: "pending",
      });

      const approvedApplications = await Application.countDocuments({
        status: "approved",
      });

      const paidApplications = await Application.countDocuments({
        paymentStatus: "paid",
      });

      const revenue = paidApplications * 500;

      // ✅ MONTHLY APPLICATION GROWTH
      const monthlyApplications = await Application.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // ✅ MONTHLY APPROVED GROWTH
      const monthlyApproved = await Application.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        totalUsers,
        totalFranchises,
        totalApplications,
        pendingApplications,
        approvedApplications,
        revenue,
        monthlyApplications,
        monthlyApproved,
      });
    } catch (error) {
      console.error("ADMIN STATS ERROR:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  }
);

/**
 * GET ALL APPLICATIONS (ADMIN VIEW)
 */
router.get(
  "/applications",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const applications = await Application.find()
        .populate("investor", "name email avatar")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("FETCH APPLICATIONS ERROR:", error);
      res.status(500).json({ message: "Failed to load applications" });
    }
  }
);

/**
 * UPDATE APPLICATION STATUS (ADMIN)
 * ✅ FIXED: uses req.app.get("io") + type field + franchisor notification
 */
router.put(
  "/applications/:id/status",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
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

      // ✅ GET SOCKET INSTANCE CORRECTLY
      const io = req.app.get("io");

      // ✅ BUILD INVESTOR NOTIFICATION MESSAGE
      let investorMessage = "";
      if (status === "approved") {
        investorMessage = `✅ Your application for "${application.franchiseName}" has been approved by Admin.`;
      } else if (status === "rejected") {
        investorMessage = `❌ Your application for "${application.franchiseName}" has been rejected by Admin.${
          remarks ? ` Reason: ${remarks}` : " Contact admin for more details."
        }`;
      } else if (status === "shortlisted") {
        investorMessage = `⭐ Your application for "${application.franchiseName}" has been shortlisted by Admin.`;
      }

      // ✅ NOTIFY INVESTOR
      if (investorMessage) {
        const investorNotification = await Notification.create({
          user: application.investor,
          message: investorMessage,
          type: "status_update",
          applicationId: application._id,
          read: false,
        });

        if (io) {
          io.to(application.investor.toString()).emit("newNotification", {
            _id: investorNotification._id,
            message: investorNotification.message,
            type: investorNotification.type,
            applicationId: investorNotification.applicationId,
            read: false,
            createdAt: investorNotification.createdAt,
          });
          console.log("📡 Investor notified by admin action:", application.investor.toString());
        }
      }

      // ✅ NOTIFY FRANCHISOR (whoever owns the franchise)
      const franchise = await Franchise.findById(application.franchiseId);
      if (franchise && franchise.owner) {
        let franchisorMessage = "";
        if (status === "approved") {
          franchisorMessage = `✅ Admin approved an application for your franchise "${application.franchiseName}".`;
        } else if (status === "rejected") {
          franchisorMessage = `❌ Admin rejected an application for your franchise "${application.franchiseName}".`;
        } else if (status === "shortlisted") {
          franchisorMessage = `⭐ Admin shortlisted an application for your franchise "${application.franchiseName}".`;
        }

        if (franchisorMessage) {
          const franchisorNotification = await Notification.create({
            user: franchise.owner,
            message: franchisorMessage,
            type: "status_update",
            applicationId: application._id,
            read: false,
          });

          if (io) {
            io.to(franchise.owner.toString()).emit("newNotification", {
              _id: franchisorNotification._id,
              message: franchisorNotification.message,
              type: franchisorNotification.type,
              applicationId: franchisorNotification.applicationId,
              read: false,
              createdAt: franchisorNotification.createdAt,
            });
            console.log("📡 Franchisor notified by admin action:", franchise.owner.toString());
          }
        }
      }

      res.json(application);
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  }
);

/**
 * GET ALL USERS
 */
router.get(
  "/users",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const users = await User.find({ role: "investor" })
        .select("-password")
        .sort({ createdAt: -1 });

      const usersWithCount = await Promise.all(
        users.map(async (user) => {
          const applicationCount = await Application.countDocuments({
            investor: user._id,
          });
          return {
            ...user.toObject(),
            applicationCount,
          };
        })
      );

      res.json({ users: usersWithCount });
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

/**
 * GET SINGLE USER DETAILS
 */
router.get(
  "/users/:id",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const applications = await Application.find({ investor: req.params.id })
        .sort({ createdAt: -1 });

      const formattedApplications = applications.map((app) => ({
        franchiseName: "N/A",
        status: app.status,
        investmentAmount: app.investmentAmount,
        preferredLocation: app.preferredLocation,
        submittedAt: app.createdAt,
      }));

      res.json({
        ...user.toObject(),
        applications: formattedApplications,
      });
    } catch (error) {
      console.error("FETCH USER DETAIL ERROR:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  }
);

/**
 * DELETE USER
 */
router.delete(
  "/users/:id",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(403).json({ message: "Admin cannot be deleted" });
      }

      await user.deleteOne();

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

router.post(
  "/create-franchise",
  auth(),
  roleMiddleware("admin"),
  adminController.createFranchise
);

/**
 * GET ALL FRANCHISES
 */
router.get(
  "/franchises",
  auth(),
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const franchises = await Franchise.find()
        .populate("owner", "name email")
        .sort({ createdAt: -1 });

      res.json(franchises);
    } catch (error) {
      console.error("FETCH FRANCHISES ERROR:", error);
      res.status(500).json({ message: "Failed to fetch franchises" });
    }
  }
);

module.exports = router;