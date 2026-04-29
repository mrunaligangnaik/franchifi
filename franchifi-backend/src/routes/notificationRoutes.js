const express = require("express");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth(), getMyNotifications);
router.put("/:id/read", auth(), markAsRead);
router.put("/read-all", auth(), markAllAsRead);

// ✅ TEST ROUTE - REMOVE AFTER TESTING
router.post("/test", auth(), async (req, res) => {
  const { createNotification } = require("../controllers/notificationController");
  
  await createNotification(req.user.id, "🎉 Test notification! Your application has been approved!");
  
  res.json({ message: "Test notification created" });
});
module.exports = router;