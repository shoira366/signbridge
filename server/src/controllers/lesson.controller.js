const prisma = require("../config/prisma.config");

// GET ALL LESSONS
exports.getAllLessons = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const lessons = await prisma.lesson.findMany({
      where: categoryId
        ? { categoryId: parseInt(categoryId) }
        : {},
      include: {
        category: true,
        signs: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          include: {
            questions: true
          }
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

// GET LESSON BY ID
exports.getLessonById = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        category: true,
        signs: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          include: {
            questions: true
          }
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
};

// CREATE LESSON
exports.createLesson = async (req, res) => {
  try {
    const { 
      categoryId, 
      title, 
      description, 
      difficulty, 
      videoUrl,
      imageUrl,
      order,
      isPremium 
    } = req.body;

    // Validate required fields
    if (!categoryId || !title) {
      return res.status(400).json({ error: "Category ID and title are required" });
    }

    const lesson = await prisma.lesson.create({
      data: {
        categoryId: parseInt(categoryId),
        title,
        description: description || null,
        difficulty: difficulty || "beginner",
        videoUrl: videoUrl || null,
        imageUrl: imageUrl || null,
        order: order ? parseInt(order) : 0,
        isPremium: isPremium || false,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

// UPDATE LESSON
exports.updateLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      categoryId,
      title, 
      description, 
      difficulty, 
      videoUrl,
      imageUrl,
      order,
      isPremium 
    } = req.body;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : null,
        difficulty: difficulty !== undefined ? difficulty : undefined,
        videoUrl: videoUrl !== undefined ? videoUrl : null,
        imageUrl: imageUrl !== undefined ? imageUrl : null,
        order: order !== undefined ? parseInt(order) : undefined,
        isPremium: isPremium !== undefined ? isPremium : undefined,
      },
      include: {
        category: true,
      },
    });

    res.json(lesson);
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

// DELETE LESSON
exports.deleteLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        signs: true,
        quizzes: true,
      },
    });

    if (!existingLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // First delete all related data (signs, quizzes, user progress)
    await prisma.$transaction([
      prisma.userProgress.deleteMany({ where: { lessonId: id } }),
      prisma.userAnswer.deleteMany({ where: { lessonId: id } }),
      prisma.quizQuestion.deleteMany({ 
        where: { quiz: { lessonId: id } } 
      }),
      prisma.quiz.deleteMany({ where: { lessonId: id } }),
      prisma.sign.deleteMany({ where: { lessonId: id } }),
      prisma.lesson.delete({ where: { id } }),
    ]);

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};

// GET LESSONS BY CATEGORY
exports.getLessonsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);

    const lessons = await prisma.lesson.findMany({
      where: { categoryId },
      include: {
        category: true,
        signs: {
          orderBy: { order: 'asc' }
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lessons by category" });
  }
};

// TOGGLE LESSON PREMIUM STATUS
exports.toggleLessonPremium = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isPremium } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { isPremium },
    });

    res.json({ 
      message: `Lesson premium status updated to ${isPremium}`,
      lesson 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update lesson premium status" });
  }
};