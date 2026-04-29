const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", lessonController.getAllLessons);
router.get("/category/:categoryId", lessonController.getLessonsByCategory);
router.get("/:id", lessonController.getLessonById);

// Admin only routes
router.post("/", authenticateUser, lessonController.createLesson);
router.put("/:id", authenticateUser, lessonController.updateLesson);
router.delete("/:id", authenticateUser, lessonController.deleteLesson);
router.patch("/:id/premium", authenticateUser, lessonController.toggleLessonPremium);

module.exports = router;