const Notification = require("../models/Notification");

// -------------------- GET MY NOTIFICATIONS --------------------
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// -------------------- MARK AS READ --------------------
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// -------------------- MARK ALL AS READ --------------------
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// -------------------- CREATE NOTIFICATION (HELPER) --------------------
exports.createNotification = async (userId, message) => {
  try {
    await Notification.create({
      user: userId,
      message: message,
      read: false,
    });
    console.log(`✅ Notification created for user ${userId}`);
  } catch (err) {
    console.error("❌ Failed to create notification:", err);
  }
};

module.exports = exports;