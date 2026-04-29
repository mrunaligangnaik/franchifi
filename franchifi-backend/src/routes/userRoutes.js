const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * UPDATE PROFILE IMAGE
 */
router.put("/profile-image", authMiddleware(), async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile image updated",
      user,
    });
  } catch (error) {
    console.error("PROFILE IMAGE UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
