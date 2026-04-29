const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware")

// All admin routes require authentication AND admin role
router.use(authenticateUser)
router.use(authorizeAdmin);

// Dashboard & Stats
router.get("/stats", adminController.getStats);
router.get("/subscription-stats", adminController.getSubscriptionStats);

// User Management
router.get("/users", adminController.getUsers);
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.delete("/users/:userId/progress", adminController.resetUserProgress);
router.delete("/users/:userId", adminController.deleteUser);

// Lesson Management
router.get("/lessons", adminController.getAllLessons);
router.post("/lessons", adminController.createLesson);
router.put("/lessons/:lessonId", adminController.updateLesson);
router.delete("/lessons/:lessonId", adminController.deleteLesson);

module.exports = router;