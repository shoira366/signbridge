const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ALLOWED_TYPES = [
  "sign_to_meaning_mcq",
  "word_to_sign_mcq",
  "camera_sign_match",
  "sign_to_text",
  "match_pairs",
];

const createQuiz = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { title } = req.body;

    if (!lessonId || !title?.trim()) {
      return res.status(400).json({ message: "lessonId and title are required" });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title: title.trim(),
      },
    });

    return res.status(201).json(quiz);
  } catch (error) {
    console.error("Create quiz error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getQuizzesByLesson = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(quizzes);
  } catch (error) {
    console.error("Get quizzes by lesson error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: true,
        questions: {
          include: {
            sign: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    console.error("Get quiz by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createQuizQuestion = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { type, prompt, signId, correctAnswer, optionsJson } = req.body;

    if (!quizId || !type || !prompt?.trim()) {
      return res.status(400).json({
        message: "quizId, type, and prompt are required",
      });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Invalid quiz question type",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            signs: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (signId) {
      const sign = await prisma.sign.findUnique({
        where: { id: Number(signId) },
      });

      if (!sign) {
        return res.status(404).json({ message: "Sign not found" });
      }
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        type,
        prompt: prompt.trim(),
        signId: signId ? Number(signId) : null,
        correctAnswer: correctAnswer ? String(correctAnswer) : null,
        optionsJson: optionsJson ?? null,
      },
      include: {
        sign: true,
      },
    });

    return res.status(201).json(question);
  } catch (error) {
    console.error("Create quiz question error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getQuizQuestions = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId },
      include: {
        sign: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(questions)

    return res.json(questions);
  } catch (error) {
    console.error("Get quiz questions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQuizQuestion = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.quizQuestion.delete({
      where: { id },
    });

    return res.json({ message: "Quiz question deleted successfully" });
  } catch (error) {
    console.error("Delete quiz question error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createQuiz,
  getQuizzesByLesson,
  getQuizById,
  deleteQuiz,
  createQuizQuestion,
  getQuizQuestions,
  deleteQuizQuestion,
};