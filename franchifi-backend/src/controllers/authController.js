const User = require("../models/User");
const Franchise = require("../models/Franchise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const emailLower = email.toLowerCase();

    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashed,
      role: "investor",
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      gender: newUser.gender,
      birthday: newUser.birthday,
      avatar: newUser.avatar,
    };

    return res.json({
      message: "Registered successfully",
      token,
      user: userResponse
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const emailLower = email.toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
      avatar: user.avatar,
    };

    return res.json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// GET PROFILE
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("GetMe Error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// UPDATE PROFILE
exports.updateMe = async (req, res) => {
  try {
    let birthday = null;
    if (req.body.birthday) {
      const d = new Date(req.body.birthday);
      birthday = isNaN(d) ? null : d;
    }

    let avatarUrl;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "users",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      avatarUrl = uploadResult.secure_url;
    }

    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      birthday,
    };

    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("UpdateMe Error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// CREATE ADMIN (ONE TIME ONLY)
exports.createAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    });

    res.json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Admin creation failed" });
  }
};

// CREATE Franchisor (ADMIN ONLY)
exports.createFranchisor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailLower = email.toLowerCase();

    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newFranchisor = await User.create({
      name,
      email: emailLower,
      password: hashed,
      role: "Franchisor",
    });

    return res.json({
      message: "Franchisor created successfully",
      user: {
        _id: newFranchisor._id,
        name: newFranchisor.name,
        email: newFranchisor.email,
        role: newFranchisor.role,
      }
    });
  } catch (err) {
    console.error("Create Franchisor Error:", err);
    return res.status(500).json({ message: "Failed to create Franchisor" });
  }
};

// ✅ NEW: CREATE BULK FRANCHISORS
exports.createBulkFranchisors = async (req, res) => {
  try {
    const { franchises } = req.body;
    const results = [];

    for (const franchise of franchises) {
      const { franchiseId, franchiseName, email, password } = franchise;

      // Check if user already exists
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        results.push({ franchiseName, email, status: "already exists" });
        continue;
      }

      // Create franchisor account
      const hashed = await bcrypt.hash(password, 10);
      const newFranchisor = await User.create({
        name: franchiseName,
        email: email.toLowerCase(),
        password: hashed,
        role: "Franchisor",
      });

      // Update franchise with owner
      await Franchise.findByIdAndUpdate(franchiseId, {
        owner: newFranchisor._id,
        ownerName: franchiseName
      });

      results.push({ 
        franchiseName, 
        email, 
        password,
        status: "created successfully" 
      });
    }

    res.json({ 
      message: "Bulk franchisor creation completed",
      results 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create franchisors" });
  }
};