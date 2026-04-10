const prisma = require("../config/prisma.config");

exports.saveProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lessonId, completed, score } = req.body;

    const parsedLessonId = Number(lessonId);
    if (!parsedLessonId) {
      return res.status(400).json({ message: "Valid lessonId is required" });
    }

    const normalizedScore = Math.max(0, Math.min(100, Number(score ?? 0)));

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: parsedLessonId,
        },
      },
      update: {
        ...(completed !== undefined && { completed }),
        ...(score !== undefined && { score: normalizedScore }),
        updatedAt: new Date(),
      },
      create: {
        userId,
        lessonId: parsedLessonId,
        completed: completed ?? false,
        score: normalizedScore,
      },
    });

    res.json({
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save progress" });
  }
};

exports.getMyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

exports.getLessonProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    res.json(progress || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lesson progress" });
  }
};