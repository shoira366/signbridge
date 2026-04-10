const prisma = require("../config/prisma.config");

exports.getAllLessons = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const lessons = await prisma.lesson.findMany({
      where: categoryId
        ? { categoryId: parseInt(categoryId) }
        : {},
      include: {
        category: true,
        signs: true,
        quizzes: {
            include: {
                questions: true
            }
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        category: true,
        signs: true,
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

exports.createLesson = async (req, res) => {
  try {
    const { categoryId, title, description, difficulty, videoUrl } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        categoryId,
        title,
        description,
        difficulty,
        videoUrl,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, difficulty, videoUrl } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { title, description, difficulty, videoUrl },
    });

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.lesson.delete({
      where: { id },
    });

    res.json({ message: "Lesson deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};