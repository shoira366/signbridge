const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const notificationController = require("../controllers/notification.controller");

// All routes require authentication
router.get("/", authenticateUser, notificationController.getUserNotifications);
router.get("/unread-count", authenticateUser, notificationController.getUnreadCount);
router.patch("/:id/read", authenticateUser, notificationController.markAsRead);
router.patch("/read-all", authenticateUser, notificationController.markAllAsRead);
router.delete("/:id", authenticateUser, notificationController.deleteNotification);

module.exports = router;