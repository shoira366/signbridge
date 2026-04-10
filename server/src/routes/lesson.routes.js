const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");
const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");

router.get("/", lessonController.getAllLessons);
router.get("/:id", lessonController.getLessonById);
router.post("/", authenticateUser, authorizeAdmin, lessonController.createLesson);
router.put("/:id", authenticateUser, authorizeAdmin, lessonController.updateLesson);
router.delete("/:id", authenticateUser, authorizeAdmin, lessonController.deleteLesson);

module.exports = router;