const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");

// ==================== USER ROUTES (authenticated users) ====================

router.get("/", authenticateUser, quizController.getAllQuizzes);
router.get("/lessons/:lessonId", authenticateUser, quizController.getQuizzesByLesson);
router.get("/:quizId/questions", authenticateUser, quizController.getQuizQuestions);
router.post("/:quizId/submit", authenticateUser, quizController.submitQuiz);
router.get("/:quizId", authenticateUser, quizController.getQuizById);

// ==================== ADMIN ROUTES (admin only) ====================

router.get("/all", authenticateUser, authorizeAdmin, quizController.adminGetAllQuizzes);
router.get("/lessons/:lessonId", authenticateUser, authorizeAdmin, quizController.adminGetQuizzesByLesson);
router.get("/:quizId", authenticateUser, authorizeAdmin, quizController.adminGetQuizById);
router.post("/lessons/:lessonId", authenticateUser, authorizeAdmin, quizController.adminCreateQuiz);
router.put("/:quizId", authenticateUser, authorizeAdmin, quizController.adminUpdateQuiz);
router.delete("/:quizId", authenticateUser, authorizeAdmin, quizController.adminDeleteQuiz);
router.post("/:quizId/questions", authenticateUser, authorizeAdmin, quizController.adminCreateQuizQuestion);
router.put("/questions/:questionId", authenticateUser, authorizeAdmin, quizController.adminUpdateQuizQuestion);
router.delete("/questions/:questionId", authenticateUser, authorizeAdmin, quizController.adminDeleteQuizQuestion);

module.exports = router;