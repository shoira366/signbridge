const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progress.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.get("/me", authenticateUser, progressController.getMyProgress);
router.post("/", authenticateUser, progressController.saveProgress);
router.get("/lesson/:lessonId", authenticateUser, progressController.getLessonProgress);

module.exports = router;