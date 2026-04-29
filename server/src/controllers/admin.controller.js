const prisma = require("../config/prisma.config");

// Get admin statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: { gte: today }
      }
    });
    
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        plan: { not: "FREE" },
        status: "ACTIVE"
      }
    });
    
    const totalLessonsCompleted = await prisma.userProgress.count({
      where: { completed: true }
    });
    
    // Calculate total revenue (sum of all subscription payments)
    // This assumes you have a Payment table or similar
    // For now, return 0
    const totalRevenue = 0;
    
    res.json({
      totalUsers,
      newUsersToday,
      activeSubscriptions,
      totalLessonsCompleted,
      totalRevenue
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// Get all users with their progress and subscriptions
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        progress: {
          where: { completed: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      subscription: user.subscription || { plan: "FREE" },
      completedLessonsCount: user.progress.length
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get single user details
exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        progress: {
          include: {
            lesson: {
              include: {
                category: true
              }
            }
          }
        },
        userAchievements: {
          include: {
            achievement: true
          }
        },
        userStreak: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    // Prevent admin from changing their own role to user
    if (userId === req.user.userId && role === 'user') {
      return res.status(400).json({ error: "You cannot remove your own admin privileges" });
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    // Create notification for user about role change
    await prisma.notification.create({
      data: {
        userId: userId,
        title: "Role Updated",
        message: `Your account role has been changed to ${role.toUpperCase()}.`,
        type: "SUBSCRIPTION",
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Reset user progress
exports.resetUserProgress = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Delete all user progress
    await prisma.userProgress.deleteMany({
      where: { userId }
    });
    
    // Delete all sign progress
    await prisma.userSignProgress.deleteMany({
      where: { userId }
    });
    
    // Delete all user answers
    await prisma.userAnswer.deleteMany({
      where: { userId }
    });
    
    // Reset streak
    await prisma.userStreak.upsert({
      where: { userId },
      update: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      },
      create: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
    
    res.json({ message: "User progress reset successfully" });
  } catch (error) {
    console.error("Reset progress error:", error);
    res.status(500).json({ error: "Failed to reset progress" });
  }
};

// Delete user account (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Get all lessons (for admin lesson management)
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        category: true,
        signs: true,
        quizzes: {
          include: {
            questions: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    res.json(lessons);
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

// Create new lesson
exports.createLesson = async (req, res) => {
  try {
    const { title, description, categoryId, difficulty, isPremium, order } = req.body;
    
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        difficulty: difficulty || "beginner",
        isPremium: isPremium || false,
        order: order || 0,
      },
      include: {
        category: true
      }
    });
    
    res.status(201).json(lesson);
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const { title, description, categoryId, difficulty, isPremium, order } = req.body;
    
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        difficulty,
        isPremium,
        order,
      },
      include: {
        category: true
      }
    });
    
    res.json(lesson);
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    
    await prisma.lesson.delete({
      where: { id: lessonId }
    });
    
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};

// Get subscription statistics
exports.getSubscriptionStats = async (req, res) => {
  try {
    const freeUsers = await prisma.subscription.count({
      where: { plan: "FREE" }
    });
    
    const premiumMonthly = await prisma.subscription.count({
      where: { plan: "MONTHLY", status: "ACTIVE" }
    });
    
    const premiumYearly = await prisma.subscription.count({
      where: { plan: "YEARLY", status: "ACTIVE" }
    });
    
    const lifetime = await prisma.subscription.count({
      where: { plan: "LIFETIME", status: "ACTIVE" }
    });
    
    res.json({
      free: freeUsers,
      monthly: premiumMonthly,
      yearly: premiumYearly,
      lifetime: lifetime,
      totalPremium: premiumMonthly + premiumYearly + lifetime
    });
  } catch (error) {
    console.error("Get subscription stats error:", error);
    res.status(500).json({ error: "Failed to fetch subscription stats" });
  }
};