const prisma = require("../config/prisma.config");
const { checkUserAchievements } = require("./achievement.controller");

// ==================== HELPER FUNCTIONS ====================

// Update user streak when ANY activity happens
async function updateUserStreak(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = await prisma.userStreak.findUnique({
      where: { userId },
    });
    
    if (!streak) {
      // Create new streak
      streak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
      return { currentStreak: 1, isNewStreak: true };
    }
    
    const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
    lastActive?.setHours(0, 0, 0, 0);
    
    const daysDiff = lastActive ? Math.floor((today - lastActive) / (1000 * 60 * 60 * 24)) : 1;
    
    let newStreak = streak.currentStreak;
    let isNewStreak = false;
    
    if (daysDiff === 1) {
      // Consecutive day - increase streak
      newStreak = streak.currentStreak + 1;
      isNewStreak = true;
    } else if (daysDiff === 0) {
      // Same day - no change
      newStreak = streak.currentStreak;
      isNewStreak = false;
    } else if (daysDiff > 1) {
      // Streak broken - reset to 1
      newStreak = 1;
      isNewStreak = true;
    }
    
    const updatedStreak = await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(streak.longestStreak, newStreak),
        lastActiveDate: today,
      },
    });
    
    // Create notification for streak milestones
    if (isNewStreak && (newStreak === 7 || newStreak === 14 || newStreak === 30 || newStreak === 100)) {
      await prisma.notification.create({
        data: {
          userId,
          title: "🔥 Streak Milestone!",
          message: `Amazing! You've maintained a ${newStreak}-day learning streak!`,
          type: "STREAK_REMINDER",
        },
      });
    }
    
    return { 
      currentStreak: updatedStreak.currentStreak, 
      longestStreak: updatedStreak.longestStreak,
      isNewStreak 
    };
  } catch (error) {
    console.error("Update streak error:", error);
    return { currentStreak: 0, longestStreak: 0, isNewStreak: false };
  }
}

// Update daily activity
async function updateDailyActivity(userId, type = 'lesson_completed') {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updateData = {};
    if (type === 'lesson_completed') {
      updateData.lessonsCompleted = { increment: 1 };
    } else if (type === 'quiz_taken') {
      updateData.quizzesTaken = { increment: 1 };
    } else if (type === 'sign_learned') {
      updateData.signsLearned = { increment: 1 };
    }
    
    await prisma.dailyActivity.upsert({
      where: {
        userId_activityDate: {
          userId,
          activityDate: today,
        },
      },
      update: updateData,
      create: {
        userId,
        activityDate: today,
        lessonsCompleted: type === 'lesson_completed' ? 1 : 0,
        quizzesTaken: type === 'quiz_taken' ? 1 : 0,
        signsLearned: type === 'sign_learned' ? 1 : 0,
        timeSpent: 0,
      },
    });
  } catch (error) {
    console.error("Update daily activity error:", error);
  }
}

// Track user activity (call this on ANY user action)
async function trackUserActivity(userId, activityType = 'general') {
  try {
    // Update streak
    const streakResult = await updateUserStreak(userId);
    
    // Update daily activity
    await updateDailyActivity(userId, activityType);
    
    // Check achievements
    const newAchievements = await checkUserAchievements(userId);
    
    return {
      streak: streakResult,
      newAchievements,
    };
  } catch (error) {
    console.error("Track user activity error:", error);
    return null;
  }
}

// ==================== MAIN CONTROLLER FUNCTIONS ====================

// SAVE PROGRESS (when user completes a lesson)
exports.saveProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lessonId, completed, score } = req.body;

    const normalizedScore = Math.max(0, Math.min(100, Number(score ?? 0)));

    const existing = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId: Number(lessonId) },
      },
    });

    const bestScore = Math.max(existing?.bestScore || 0, normalizedScore);

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId: Number(lessonId) },
      },
      update: {
        lastScore: normalizedScore,
        bestScore,
        ...(completed !== undefined && {
          completed,
          completedAt: completed ? new Date() : null,
        }),
      },
      create: {
        userId,
        lessonId: Number(lessonId),
        lastScore: normalizedScore,
        bestScore: normalizedScore,
        completed: completed ?? false,
        completedAt: completed ? new Date() : null,
      },
    });

    // After marking lesson as completed
    if (completed && !existing?.completed) {
      const completionHour = new Date().getHours();
      console.log(`📊 Lesson ${lessonId} completed by user ${userId} at ${new Date().toLocaleString()}`);
      console.log(`   Completion hour: ${completionHour}:00`);
      
      if (completionHour < 9) {
        console.log(`   🐦 EARLY BIRD! Completed before 9 AM`);
      }
      
      const newAchievements = await checkUserAchievements(userId);
      if (newAchievements && newAchievements.length > 0) {
        console.log(`🎉 User ${userId} unlocked ${newAchievements.length} new achievement(s)!`);
      }
    }

    res.json(progress);
  } catch (err) {
    console.error("Save progress error:", err);
    res.status(500).json({ error: "Save failed" });
  }
};

// SAVE USER ANSWERS (when user answers questions)
exports.saveUserAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    // Get all questions with their quiz IDs
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.quizQuestion.findMany({
      where: {
        id: { in: questionIds }
      },
      select: {
        id: true,
        quizId: true
      }
    });

    const questionToQuizMap = {};
    questions.forEach(q => {
      questionToQuizMap[q.id] = q.quizId;
    });

    // Delete existing answers for this lesson
    await prisma.userAnswer.deleteMany({
      where: {
        userId,
        lessonId,
      },
    });

    const answerData = answers.map(answer => ({
      userId,
      lessonId,
      quizId: questionToQuizMap[answer.questionId] || null,
      questionId: answer.questionId,
      selectedAnswer: String(answer.selectedAnswer),
      isCorrect: answer.isCorrect || false,
      attempt: 1,
    }));

    const savedAnswers = await prisma.userAnswer.createMany({
      data: answerData,
    });

    // TRACK ACTIVITY - User answered questions (this updates streak!)
    const activityResult = await trackUserActivity(userId, 'quiz_taken');

    res.json({ 
      message: "Answers saved successfully",
      count: savedAnswers.count,
      streak: activityResult?.streak,
      newAchievements: activityResult?.newAchievements,
    });
  } catch (err) {
    console.error("Save user answers error:", err);
    res.status(500).json({ error: "Failed to save answers" });
  }
};

// GET USER ANSWERS FOR LESSON
exports.getUserAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);

    const answers = await prisma.userAnswer.findMany({
      where: {
        userId,
        lessonId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const uniqueAnswers = [];
    const seenQuestions = new Set();
    for (const answer of answers) {
      if (!seenQuestions.has(answer.questionId)) {
        seenQuestions.add(answer.questionId);
        uniqueAnswers.push(answer);
      }
    }

    res.json(uniqueAnswers);
  } catch (err) {
    console.error("Get user answers error:", err);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
};

// CLEAR USER ANSWERS FOR LESSON
exports.clearUserAnswers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);

    await prisma.userAnswer.deleteMany({
      where: {
        userId,
        lessonId,
      },
    });

    res.json({ message: "Answers cleared successfully" });
  } catch (err) {
    console.error("Clear user answers error:", err);
    res.status(500).json({ error: "Failed to clear answers" });
  }
};

// COMPLETE LESSON (deprecated - use saveProgress instead)
exports.completeLesson = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        lastScore: 0,
        bestScore: 0,
        attempts: 0,
      },
    });

    // Track activity
    const activityResult = await trackUserActivity(userId, 'lesson_completed');

    res.json({
      progress,
      streak: activityResult?.streak,
      newAchievements: activityResult?.newAchievements,
    });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ error: "Complete failed" });
  }
};

// GET ALL PROGRESS
exports.getMyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: { category: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });
    
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId },
    });

    const dailyActivity = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { activityDate: "desc" },
      take: 7,
    });

    res.json({
      progress,
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      achievementsCount,
      dailyActivity,
    });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// GET LESSON PROGRESS
exports.getLessonProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = Number(req.params.lessonId);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { quizzes: true, signs: true },
    });

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
    
    // Get completed signs for this lesson
    const signIds = lesson?.signs?.map(s => s.id) || [];
    const completedSignsData = await prisma.userSignProgress.findMany({
      where: {
        userId,
        signId: { in: signIds },
        mastered: true
      },
      select: { signId: true }
    });
    
    const completedSigns = completedSignsData.map(cs => cs.signId);

    // Get saved answers if lesson is completed
    let answers = [];
    if (progress?.completed) {
      answers = await prisma.userAnswer.findMany({
        where: {
          userId,
          lessonId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      const uniqueAnswers = [];
      const seenQuestions = new Set();
      for (const answer of answers) {
        if (!seenQuestions.has(answer.questionId)) {
          seenQuestions.add(answer.questionId);
          uniqueAnswers.push(answer);
        }
      }
      answers = uniqueAnswers;
    }

    res.json({
      lessonId,
      completed: progress?.completed || false,
      completedAt: progress?.completedAt || null,
      quizUnlocked: progress?.completed || false,
      lastScore: progress?.lastScore || 0,
      bestScore: progress?.bestScore || 0,
      attemptCount: progress?.attempts || 0,
      hasQuiz: lesson?.quizzes.length > 0,
      answers: answers,
      completedSigns: completedSigns, // Add this line
      totalSigns: lesson?.signs.length || 0,
    });
  } catch (err) {
    console.error("Get lesson progress error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// GET CURRENT STREAK (NEW)
exports.getCurrentStreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = streak?.lastActiveDate ? new Date(streak.lastActiveDate) : null;
    lastActive?.setHours(0, 0, 0, 0);
    
    const daysDiff = lastActive ? Math.floor((today - lastActive) / (1000 * 60 * 60 * 24)) : 1;
    const isActiveToday = daysDiff === 0;
    
    res.json({
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      lastActiveDate: streak?.lastActiveDate,
      isActiveToday,
    });
  } catch (err) {
    console.error("Get streak error:", err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};

// Track sign progress (mark sign as viewed/learned)
exports.trackSignProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = parseInt(req.params.lessonId);
    const { signId, completed } = req.body;
    
    // Update or create sign progress
    const result = await prisma.userSignProgress.upsert({
      where: {
        userId_signId: {
          userId,
          signId: signId
        }
      },
      update: {
        mastered: completed,
        masteredAt: completed ? new Date() : null,
        attempts: { increment: 1 }
      },
      create: {
        userId,
        signId: signId,
        mastered: completed || false,
        attempts: 1
      }
    });
    
    res.json({ 
      success: true, 
      message: completed ? "Sign marked as learned" : "Sign progress updated",
      data: result
    });
  } catch (error) {
    console.error("Track sign progress error:", error);
    res.status(500).json({ error: "Failed to track sign progress" });
  }
};

// Reset sign progress (set mastered to false for all signs in a lesson)
exports.resetSignProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lessonId = parseInt(req.params.lessonId);
    
    // Get all signs for this lesson
    const signs = await prisma.sign.findMany({
      where: { lessonId },
      select: { id: true }
    });
    
    const signIds = signs.map(s => s.id);
    
    if (signIds.length === 0) {
      return res.json({ message: "No signs found for this lesson" });
    }
    
    // Update all sign progress to mastered = false
    const updated = await prisma.userSignProgress.updateMany({
      where: {
        userId,
        signId: { in: signIds }
      },
      data: {
        mastered: false,
        masteredAt: null,
        updatedAt: new Date()
      }
    });
    
    console.log(`Reset ${updated.count} sign progress records for user ${userId}, lesson ${lessonId}`);
    
    res.json({ 
      message: "Sign progress reset successfully",
      resetCount: updated.count
    });
  } catch (error) {
    console.error("Reset sign progress error:", error);
    res.status(500).json({ error: "Failed to reset sign progress" });
  }
};

// Reset single sign progress (set mastered to false)
exports.resetSingleSignProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const signId = parseInt(req.params.signId);
    
    const updated = await prisma.userSignProgress.updateMany({
      where: {
        userId,
        signId: signId
      },
      data: {
        mastered: false,
        masteredAt: null,
        updatedAt: new Date()
      }
    });
    
    res.json({ 
      message: "Sign progress reset successfully",
      resetCount: updated.count
    });
  } catch (error) {
    console.error("Reset single sign progress error:", error);
    res.status(500).json({ error: "Failed to reset sign progress" });
  }
};

// Track user activity (for streak)
exports.trackActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const streak = await prisma.userStreak.findUnique({
      where: { userId }
    });
    
    if (!streak) {
      await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today
        }
      });
    } else {
      const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
      const daysDiff = lastActive ? Math.floor((today - lastActive) / (1000 * 60 * 60 * 24)) : 1;
      
      let newStreak = streak.currentStreak;
      
      if (daysDiff === 1) {
        newStreak = streak.currentStreak + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
      
      await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastActiveDate: today
        }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Track activity error:", error);
    res.status(500).json({ error: "Failed to track activity" });
  }
};