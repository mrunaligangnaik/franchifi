const User = require("../models/User");
const Franchise = require("../models/Franchise");
const Application = require("../models/Application");
const bcrypt = require("bcrypt");


/**
 * ADMIN DASHBOARD STATS
 * (YOUR ORIGINAL CODE — UNCHANGED)
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const registeredCompanies = await Franchise.countDocuments();
    const pendingApprovals = await Franchise.countDocuments({ status: "pending" });
    const activeFranchises = await Franchise.countDocuments({ status: "approved" });

    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: "pending" });

    const paidApplications = await Application.countDocuments({
      paymentStatus: "paid",
    });

    const revenue = paidApplications * 500;

    res.json({
      totalUsers,
      registeredCompanies,
      pendingApprovals,
      activeFranchises,
      totalApplications,
      pendingApplications,
      revenue,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

/**
 * GET ALL APPLICATIONS (ADMIN VERIFICATION PAGE)
 * ✅ REQUIRED
 */
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("investor", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("FETCH APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/**
 * UPDATE APPLICATION STATUS (APPROVE / REJECT / SHORTLIST)
 * ✅ REQUIRED
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["approved", "rejected", "shortlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

exports.createFranchisor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const Franchisor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "Franchisor"
    });

    res.status(201).json({
      message: "Franchisor account created",
      Franchisor
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create Franchisor" });
  }
};


exports.createFranchise = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      minInvestment,
      owner
    } = req.body;

    if (!name || !industry || !minInvestment || !owner) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const franchise = await Franchise.create({
      name,
      description,
      industry,
      minInvestment,
      owner, // this must be a valid User _id
      status: "pending"
    });

    res.status(201).json({
      message: "Franchise created successfully",
      franchise
    });

  } catch (err) {
    console.error("CREATE FRANCHISE ERROR:", err);
    res.status(500).json({ message: "Failed to create franchise" });
  }
};
