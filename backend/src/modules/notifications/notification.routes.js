const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/auth.middleware");
const {
  getNotifications,
  markAllRead,
} = require("./notification.model");

/**
 * GET /api/notifications
 * Called on Dashboard load — returns all notifications for the logged-in user.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await getNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications" });
  }
});

/**
 * PATCH /api/notifications/read
 * Marks all notifications as read for the logged-in user.
 */
router.patch("/read", verifyToken, async (req, res) => {
  try {
    await markAllRead(req.user.id);
    res.json({ message: "Marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark as read" });
  }
});

module.exports = router;
