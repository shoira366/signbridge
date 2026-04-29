// server/src/controllers/achievement.controller.js
const prisma = require("../config/prisma.config");

// Helper function to check and unlock achievements (can be called directly)
async function checkUserAchievements(userId) {
  try {
    // Get user stats
    const stats = await getUserStats(userId);
    
    // Get all achievements
    const achievements = await prisma.achievement.findMany();
    
    // Get already unlocked achievements
    const unlockedAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    
    const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));
    
    // Find new achievements to unlock
    const newAchievements = [];
    
    for (const achievement of achievements) {
      if (!unlockedIds.has(achievement.id)) {
        let shouldUnlock = false;
        
        // Special handling for Early Bird achievement
        if (achievement.name === "Early Bird") {
          shouldUnlock = stats.hasEarlyBird;
        }
        // Check achievement requirements
        else if (achievement.requiredLessons > 0) {
          shouldUnlock = stats.totalLessonsCompleted >= achievement.requiredLessons;
        }
        else if (achievement.requiredStreak > 0) {
          shouldUnlock = stats.currentStreak >= achievement.requiredStreak;
        }
        else if (achievement.requiredSigns > 0) {
          shouldUnlock = stats.totalSignsLearned >= achievement.requiredSigns;
        }
        else if (achievement.requiredPoints > 0) {
          shouldUnlock = stats.totalPoints >= achievement.requiredPoints;
        }
        
        if (shouldUnlock) {
          // Unlock achievement
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              unlockedAt: new Date(),
            },
          });
          newAchievements.push(achievement);
          
          // Create notification
          await createAchievementNotification(userId, achievement);
        }
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error("Check user achievements error:", error);
    return [];
  }
}

// Get user statistics for achievement checking
async function getUserStats(userId) {
  try {
    // Get completed lessons count
    const completedLessons = await prisma.userProgress.count({
      where: {
        userId,
        completed: true,
      },
    });
    
    // Get streak
    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });
    
    // Get learned signs (mastered)
    const masteredSigns = await prisma.userSignProgress.count({
      where: {
        userId,
        mastered: true,
      },
    });
    
    // Get total points (from quiz scores)
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      select: { bestScore: true },
    });
    
    const totalPoints = progress.reduce((sum, p) => sum + (p.bestScore || 0), 0);
    
    // Check for Early Bird achievement (lesson completed before 9 AM)
    const completedLessonsWithTime = await prisma.userProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: {
          not: null
        }
      },
      select: {
        completedAt: true
      }
    });
    
    let hasEarlyBird = false;
    for (const lesson of completedLessonsWithTime) {
      if (lesson.completedAt) {
        const hour = lesson.completedAt.getHours();
        // Check if completed between midnight and 9 AM (0-8)
        if (hour >= 0 && hour < 9) {
          hasEarlyBird = true;
          console.log(`🐦 Early Bird detected: Lesson completed at ${lesson.completedAt.toLocaleString()}`);
          break;
        }
      }
    }
    
    return {
      totalLessonsCompleted: completedLessons,
      currentStreak: streak?.currentStreak || 0,
      totalSignsLearned: masteredSigns,
      totalPoints: totalPoints,
      hasEarlyBird: hasEarlyBird,
    };
  } catch (error) {
    console.error("Get user stats error:", error);
    return {
      totalLessonsCompleted: 0,
      currentStreak: 0,
      totalSignsLearned: 0,
      totalPoints: 0,
      hasEarlyBird: false,
    };
  }
}

// Create notification for unlocked achievement
async function createAchievementNotification(userId, achievement) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: "🏆 Achievement Unlocked!",
        message: `Congratulations! You've earned the "${achievement.name}" achievement.`,
        type: "ACHIEVEMENT",
      },
    });
  } catch (error) {
    console.error("Create notification error:", error);
  }
}

// ==================== EXPORTED CONTROLLER FUNCTIONS ====================

// Get all achievements with user's unlocked status
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const achievements = await prisma.achievement.findMany({
      orderBy: {
        requiredLessons: 'asc',
      },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
    }));

    res.json(achievementsWithStatus);
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
};

// Check and unlock achievements for a user (API endpoint)
exports.checkAndUnlockAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const newAchievements = await checkUserAchievements(userId);
    res.json({ unlocked: newAchievements });
  } catch (error) {
    console.error("Check achievements error:", error);
    res.status(500).json({ error: "Failed to check achievements" });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'lessons', limit = 10 } = req.query;
    
    let leaderboard = [];
    
    if (type === 'lessons') {
      // Get users with completed lessons count
      const results = await prisma.userProgress.groupBy({
        by: ['userId'],
        where: { completed: true },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: parseInt(limit),
      });
      
      if (results.length > 0) {
        // Get user details - only use fields that exist
        const userIds = results.map(entry => entry.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { 
            id: true, 
            fullName: true,
            email: true,
            role: true,
          },
        });
        
        leaderboard = results.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          user: users.find(u => u.id === entry.userId),
          count: entry._count.id,
          label: 'lessons',
        }));
      }
    } 
    else if (type === 'streak') {
      // Get users with longest streaks
      const streaks = await prisma.userStreak.findMany({
        orderBy: {
          currentStreak: 'desc',
        },
        take: parseInt(limit),
      });
      
      if (streaks.length > 0) {
        const userIds = streaks.map(s => s.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { 
            id: true, 
            fullName: true,
            email: true,
          },
        });
        
        leaderboard = streaks.map((streak, index) => ({
          rank: index + 1,
          userId: streak.userId,
          user: users.find(u => u.id === streak.userId),
          count: streak.currentStreak,
          label: 'days',
        }));
      }
    }
    else if (type === 'points') {
      // Get users with highest total points
      const allProgress = await prisma.userProgress.findMany({
        select: {
          userId: true,
          bestScore: true,
        },
      });
      
      // Aggregate points per user
      const userPoints = {};
      allProgress.forEach(p => {
        if (!userPoints[p.userId]) {
          userPoints[p.userId] = 0;
        }
        userPoints[p.userId] += p.bestScore || 0;
      });
      
      const sortedUsers = Object.entries(userPoints)
        .map(([userId, points]) => ({ userId: parseInt(userId), points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, parseInt(limit));
      
      if (sortedUsers.length > 0) {
        const userIds = sortedUsers.map(u => u.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { 
            id: true, 
            fullName: true,
            email: true,
          },
        });
        
        leaderboard = sortedUsers.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          user: users.find(u => u.id === entry.userId),
          count: entry.points,
          label: 'XP',
        }));
      }
    }
    
    res.json(leaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    // Return empty array instead of error
    res.status(200).json([]);
  }
};

// Export the helper function for use in other controllers
exports.checkUserAchievements = checkUserAchievements;