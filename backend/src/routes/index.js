const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const meetingRoutes = require("../modules/meetings/meeting.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/meetings", meetingRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;