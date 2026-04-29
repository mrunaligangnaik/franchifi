const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Franchise = require("../models/Franchise");
const auth = require("../middleware/authMiddleware");

// ✅ PUBLIC ROUTE: Get all approved & active franchises
router.get("/", async (req, res) => {
  try {
    const franchises = await Franchise.find({
      status: "approved",
      isActive: true,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(franchises);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUBLIC ROUTE: Get single franchise by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid franchise ID" });
    }

    const franchise = await Franchise.findById(id).populate(
      "owner",
      "name email"
    );

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    // Increment views without validation issues
    await Franchise.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { runValidators: false }
    );

    return res.status(200).json(franchise);
  } catch (error) {
    console.error("Error fetching franchise:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROTECTED ROUTE: Create franchise (Admin/Franchisor only)
router.post("/create", auth(), async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      minInvestment,
      location,
      applicationFee,
      image,
      ownerName,
      status,
      isActive,
      views
    } = req.body;

    // FIXED: Handle all role formats - Admin, admin, ADMIN, etc.
    const userRole = (req.user.role || "").toLowerCase().trim();
    
    console.log("🔍 User attempting to create franchise:");
    console.log("   User ID:", req.user._id);
    console.log("   User Role (original):", req.user.role);
    console.log("   User Role (normalized):", userRole);
    
    if (userRole !== "franchisor" && userRole !== "admin") {
      console.log("❌ Access denied - invalid role");
      return res.status(403).json({ 
        message: `Access denied. Your role is "${req.user.role}". Only Franchisors and admins can create franchises.` 
      });
    }

    console.log("✅ Access granted - creating franchise");

    // Create new franchise
    const franchise = new Franchise({
      name,
      description,
      industry,
      minInvestment,
      location,
      franchiseFee: applicationFee,
      image,
      ownerName,
      owner: req.user._id,
      status: userRole === "admin" ? (status || "approved") : "pending",
      isActive: userRole === "admin" ? (isActive !== undefined ? isActive : true) : false,
      views: views || 0
    });

    await franchise.save();

    console.log("✅ Franchise created successfully:", franchise._id);

    return res.status(201).json({ 
      message: "Company added successfully", 
      franchise 
    });

  } catch (error) {
    console.error("❌ Error creating franchise:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// ✅ ADMIN ROUTE: Get all franchises (all statuses)
router.get("/admin/all", auth(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const franchises = await Franchise.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(franchises);
  } catch (error) {
    console.error("Error fetching all franchises:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Franchisor ROUTE: Get their own franchises
router.get("/my/franchises", auth(), async (req, res) => {
  try {
    if (req.user.role !== "Franchisor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const franchises = await Franchise.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json(franchises);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADMIN ROUTE: Approve franchise
router.patch("/:id/approve", auth(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      { 
        status: "approved",
        isActive: true
      },
      { new: true }
    );

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    return res.status(200).json({ 
      message: "Franchise approved successfully", 
      franchise 
    });
  } catch (error) {
    console.error("Error approving franchise:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATED ROUTE: Update franchise (Admin OR Owner)
router.put("/:id", auth(), async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      minInvestment,
      location,
      applicationFee,
      image,
      ownerName,
      status,
      isActive
    } = req.body;

    const franchise = await Franchise.findById(req.params.id);
    
    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    // Check authorization
    const isAdmin = req.user.role === "admin";
    const isFranchisor = req.user.role === "Franchisor";
    const isOwner = franchise.owner.toString() === req.user.id;

    // Admin can update any franchise, Franchisor can only update their own
    if (!isAdmin && (!isFranchisor || !isOwner)) {
      return res.status(403).json({ 
        message: "Access denied. You can only update your own franchises." 
      });
    }

    console.log("✅ Update authorized - User:", req.user.role, "| Owner:", isOwner);

    // Update basic fields (both admin and franchisor can update these)
    franchise.name = name;
    franchise.description = description;
    franchise.industry = industry;
    franchise.minInvestment = minInvestment;
    franchise.location = location;
    franchise.franchiseFee = applicationFee;
    franchise.image = image;

    // Update isActive (both admin and franchisor can toggle this)
    if (isActive !== undefined) {
      franchise.isActive = isActive;
    }

    // Only admin can update status and ownerName
    if (isAdmin) {
      if (status) franchise.status = status;
      if (ownerName) franchise.ownerName = ownerName;
    }

    await franchise.save();

    console.log("✅ Franchise updated successfully:", franchise._id);

    return res.status(200).json({ 
      message: "Franchise updated successfully", 
      franchise 
    });

  } catch (error) {
    console.error("❌ Error updating franchise:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// ✅ ADMIN ROUTE: Reject franchise
router.patch("/:id/reject", auth(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      { 
        status: "rejected",
        isActive: false
      },
      { new: true }
    );

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    return res.status(200).json({ 
      message: "Franchise rejected", 
      franchise 
    });
  } catch (error) {
    console.error("Error rejecting franchise:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROTECTED ROUTE: Toggle franchise active/inactive
router.patch("/:id/toggle-active", auth(), async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id);

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    // Check ownership or admin
    if (franchise.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Can only toggle if approved
    if (franchise.status !== "approved") {
      return res.status(400).json({ message: "Can only toggle approved franchises" });
    }

    franchise.isActive = !franchise.isActive;
    await franchise.save();

    return res.status(200).json({ 
      message: `Franchise ${franchise.isActive ? "activated" : "deactivated"}`, 
      franchise 
    });
  } catch (error) {
    console.error("Error toggling franchise status:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADMIN ROUTE: Delete franchise
router.delete("/:id", auth(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const franchise = await Franchise.findByIdAndDelete(req.params.id);

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    return res.status(200).json({ 
      message: "Franchise deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting franchise:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;