const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  createFranchisor,
  createBulkFranchisors
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// GET LOGGED IN USER PROFILE
router.get("/me", authMiddleware(), getMe);

// UPDATE PROFILE
router.put(
  "/me",
  authMiddleware(),
  upload.single("avatar"),
  updateMe
);

// CREATE Franchisor (Admin only)
router.post(
  "/create-Franchisor", 
  authMiddleware(["admin"]),
  createFranchisor
);

// ✅ NEW: CREATE BULK FRANCHISORS
router.post("/create-bulk-franchisors", createBulkFranchisors);

// TEST
router.get("/test", (req, res) => {
  res.send("AUTH ROUTE WORKING");
});

module.exports = router;