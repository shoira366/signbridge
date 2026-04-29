// server/src/prisma/seed.prisma.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Seed achievements
  const achievements = [
    {
      name: "First Lesson",
      description: "Complete your first lesson",
      requiredLessons: 1,
      category: "LESSON_COMPLETION",
    },
    {
      name: "Lesson Master",
      description: "Complete 10 lessons",
      requiredLessons: 10,
      category: "LESSON_COMPLETION",
    },
    {
      name: "Quiz Champion",
      description: "Get 100% score on any quiz",
      requiredPoints: 100,
      category: "QUIZ_MASTERY",
    },
    {
      name: "7 Day Streak",
      description: "Maintain a 7 day learning streak",
      requiredStreak: 7,
      category: "STREAK_MASTER",
    },
    {
      name: "30 Day Streak",
      description: "Maintain a 30 day learning streak",
      requiredStreak: 30,
      category: "STREAK_MASTER",
    },
    {
      name: "Sign Collector",
      description: "Learn 50 signs",
      requiredSigns: 50,
      category: "SIGN_MASTER",
    },
    {
      name: "Early Bird",
      description: "Complete a lesson before 9 AM",
      requiredLessons: 1,
      category: "EARLY_BIRD",
    },
  ];

  // First, check if achievements already exist
  const existingAchievements = await prisma.achievement.findMany();
  const existingNames = new Set(existingAchievements.map(a => a.name));

  // Create only new achievements
  for (const achievement of achievements) {
    if (!existingNames.has(achievement.name)) {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`✅ Created achievement: ${achievement.name}`);
    } else {
      console.log(`⚠️ Achievement already exists: ${achievement.name}`);
    }
  }

  console.log("\n✅ Achievements seeded successfully!");
  console.log(`📊 Total achievements in database: ${await prisma.achievement.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });