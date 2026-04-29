const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progress.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.get("/me", authenticateUser, progressController.getMyProgress);
router.post("/", authenticateUser, progressController.saveProgress);
router.post(
  "/complete-lesson/:lessonId",
  authenticateUser,
  progressController.completeLesson
);
router.get(
  "/lesson/:lessonId",
  authenticateUser,
  progressController.getLessonProgress
);

// Add these to your progress routes file
router.post('/lessons/:lessonId/answers', authenticateUser, progressController.saveUserAnswers);
router.get('/lessons/:lessonId/answers', authenticateUser, progressController.getUserAnswers);
router.delete('/lessons/:lessonId/answers', authenticateUser, progressController.clearUserAnswers);

router.post("/track-activity", authenticateUser, progressController.trackActivity);
router.post("/lesson/:lessonId/sign-progress", authenticateUser, progressController.trackSignProgress);
router.patch("/lesson/:lessonId/sign-progress/reset", authenticateUser, progressController.resetSignProgress);
router.patch("/sign/:signId/progress/reset", authenticateUser, progressController.resetSingleSignProgress);

module.exports = router;