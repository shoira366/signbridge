// const express = require("express");
// const router = express.Router();
// const prisma = require("../config/prisma.config");
// const { authenticateUser, authorizeAdmin } = require("../middlewares/auth.middleware");

// router.post("/", authenticateUser, authorizeAdmin, async (req, res) => {
//   const data = req.body;

//   const quiz = await prisma.quiz.create({
//     data,
//   });

//   res.json(quiz);
// });

// router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
//   await prisma.quiz.delete({
//     where: { id: Number(req.params.id) },
//   });

//   res.json({ message: "Deleted" });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizzesByLesson,
  getQuizById,
  deleteQuiz,
  createQuizQuestion,
  getQuizQuestions,
  deleteQuizQuestion,
} = require("../controllers/quiz.controller");

router.post("/lessons/:lessonId/", createQuiz);
router.get("/lessons/:lessonId/", getQuizzesByLesson);
router.get("/:quizId", getQuizById);
router.delete("/:quizId", deleteQuiz);

router.post("/:quizId/questions", createQuizQuestion);
router.get("/:quizId/questions", getQuizQuestions);
router.delete("/questions/:id", deleteQuizQuestion);

module.exports = router;