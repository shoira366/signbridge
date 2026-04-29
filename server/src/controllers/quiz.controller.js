const prisma = require("../config/prisma.config");

const ALLOWED_TYPES = [
  "sign_to_meaning_mcq",
  "word_to_sign_mcq",
  "camera_sign_match",
  "sign_to_text",
  "match_pairs",
];

// ==================== USER PROCESSES ====================

// GET ALL QUIZZES (for users - with progress tracking)

exports.getAllQuizzes = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const quizzes = await prisma.quiz.findMany({
      include: {
        lesson: {
          include: {
            category: true,
            signs: true
          }
        },
        questions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (userId) {
      const userProgress = await prisma.userProgress.findMany({
        where: { userId },
        select: { lessonId: true, completed: true, lastScore: true, bestScore: true }
      });
      
      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.lessonId] = {
          completed: p.completed,
          score: p.lastScore || p.bestScore || 0
        };
      });
      
      const enhancedQuizzes = quizzes.map(quiz => ({
        ...quiz,
        userProgress: progressMap[quiz.lessonId] || null,
        isCompleted: progressMap[quiz.lessonId]?.completed || false
      }));
      
      return res.json(enhancedQuizzes);
    }
    
    res.json(quizzes);
  } catch (error) {
    console.error("Get all quizzes error:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

// GET QUIZZES BY LESSON (for users - checks lesson completion)
exports.getQuizzesByLesson = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const lessonId = Number(req.params.lessonId);

    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    }) : null;
    
    const isAdmin = user?.role === "admin";

    if (!isAdmin && userId) {
      const progress = await prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      if (!progress?.completed) {
        return res.status(403).json({
          message: "Complete the lesson first to access quizzes",
        });
      }
    }

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          include: { sign: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(quizzes)

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

// GET QUIZ BY ID (for users)
exports.getQuizById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const quizId = Number(req.params.quizId);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: true,
        questions: {
          include: { sign: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: quiz.lessonId,
        },
      },
    });

    if (!progress?.completed) {
      return res.status(403).json({
        message: "Complete the lesson first",
      });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

// Get quiz questions - returns ALL questions with isPremium flag
exports.getQuizQuestions = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const quizId = Number(req.params.quizId);
    
    // Get all questions (no filtering)
    const questions = await prisma.quizQuestion.findMany({
      where: { quizId },
      include: {
        sign: true
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    // Check if user has premium subscription
    let isPremium = false;
    if (userId) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId }
      });
      isPremium = subscription && subscription.plan !== 'FREE' && subscription.status === 'ACTIVE';
    }
    
    // Count premium questions
    const premiumCount = questions.filter(q => q.isPremium).length;
    
    // Return ALL questions with metadata - frontend will handle locking
    res.json({
      questions: questions, // Return ALL questions
      totalQuestions: questions.length,
      freeQuestionsCount: questions.length - premiumCount,
      premiumCount: premiumCount,
      isPremium: isPremium,
      hasPremiumQuestions: premiumCount > 0,
      message: isPremium ? "You have access to all questions" : `${premiumCount} premium questions are locked. Upgrade to unlock them.`
    });
    
  } catch (error) {
    console.error("Get quiz questions error:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// SUBMIT QUIZ (for users)
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.userId;
    const quizId = Number(req.params.quizId);
    const { answers } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: quiz.lessonId,
        },
      },
    });

    if (!progress?.completed) {
      return res.status(403).json({
        message: "Complete the lesson first before submitting quiz",
      });
    }

    let correct = 0;

    const prepared = quiz.questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = String(userAnswer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim();
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        selectedAnswer: userAnswer,
        isCorrect,
      };
    });

    const total = quiz.questions.length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const attempt = (progress?.attempts || 0) + 1;
    const bestScore = Math.max(score, progress?.bestScore || 0);

    await prisma.userAnswer.createMany({
      data: prepared.map((a) => ({
        userId,
        lessonId: quiz.lessonId,
        quizId,
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
        attempt,
      })),
    });

    await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: quiz.lessonId,
        },
      },
      update: {
        lastScore: score,
        bestScore,
        attempts: attempt,
        lastQuizAt: new Date(),
      },
      create: {
        userId,
        lessonId: quiz.lessonId,
        lastScore: score,
        bestScore: score,
        attempts: 1,
        lastQuizAt: new Date(),
      },
    });

    if (score >= 90) {
      await prisma.notification.create({
        data: {
          userId,
          title: "🎯 Excellent Quiz Score!",
          message: `Congratulations! You scored ${score}% on the quiz. Keep up the great work!`,
          type: "QUIZ_RESULT",
        },
      });
    }

    res.json({
      message: "Quiz submitted successfully",
      score,
      correct,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
};

// ==================== ADMIN PROCESSES ====================

// ADMIN: GET ALL QUIZZES
exports.adminGetAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        lesson: {
          include: {
            category: true,
            signs: true
          }
        },
        questions: {
          include: { sign: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(quizzes);
  } catch (error) {
    console.error("Get all quizzes error:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

// ADMIN: GET QUIZZES BY LESSON (no completion check)
exports.adminGetQuizzesByLesson = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          include: { sign: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

// ADMIN: GET QUIZ BY ID (no completion check)
exports.adminGetQuizById = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: true,
        questions: {
          include: { sign: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

// ADMIN: CREATE QUIZ
exports.adminCreateQuiz = async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { title } = req.body;

    if (!lessonId || !title?.trim()) {
      return res.status(400).json({ message: "lessonId and title required" });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const quiz = await prisma.quiz.create({
      data: { lessonId, title: title.trim() },
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create quiz" });
  }
};

// ADMIN: UPDATE QUIZ
exports.adminUpdateQuiz = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { title } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { title: title.trim() },
    });

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quiz" });
  }
};

// ADMIN: DELETE QUIZ
exports.adminDeleteQuiz = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    await prisma.quizQuestion.deleteMany({
      where: { quizId },
    });

    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};

// ADMIN: CREATE QUIZ QUESTION
exports.adminCreateQuizQuestion = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { type, prompt, signId, correctAnswer, optionsJson, points, order, isPremium } = req.body;

    if (!quizId || !type || !prompt?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid question type" });
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        type,
        prompt: prompt.trim(),
        signId: signId ? Number(signId) : null,
        correctAnswer: correctAnswer || null,
        optionsJson: optionsJson || null,
        points: points || 1,
        order: order || 0,
        isPremium: isPremium || false,
      },
      include: { sign: true },
    });

    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create question" });
  }
};

// ADMIN: UPDATE QUIZ QUESTION
exports.adminUpdateQuizQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const { type, prompt, signId, correctAnswer, optionsJson, points, order, isPremium } = req.body;

    const question = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        type,
        prompt: prompt?.trim(),
        signId: signId ? Number(signId) : null,
        correctAnswer: correctAnswer || null,
        optionsJson: optionsJson || null,
        points: points || 1,
        order: order || 0,
        isPremium: isPremium || false,
      },
      include: { sign: true },
    });

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// ADMIN: DELETE QUIZ QUESTION
exports.adminDeleteQuizQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);

    await prisma.quizQuestion.delete({ where: { id: questionId } });

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete question" });
  }
};