const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Categories
  const alphabet = await prisma.category.upsert({
    where: { name: "Alphabet" },
    update: {},
    create: {
      name: "Alphabet",
      description: "Learn the basics of the Uzbek sign alphabet",
    },
  });

  const greetings = await prisma.category.upsert({
    where: { name: "Greetings" },
    update: {},
    create: {
      name: "Greetings",
      description: "Learn common greeting signs and polite expressions",
    },
  });

  const dailyWords = await prisma.category.upsert({
    where: { name: "Daily Words" },
    update: {},
    create: {
      name: "Daily Words",
      description: "Learn useful words for everyday communication",
    },
  });

  // Lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 1 },
    update: {},
    create: {
      categoryId: alphabet.id,
      title: "Uzbek Sign Alphabet: A–E",
      description: "Introduction to the first five letters in Uzbek Sign Language",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 2 },
    update: {},
    create: {
      categoryId: alphabet.id,
      title: "Uzbek Sign Alphabet: F–J",
      description: "Continue learning alphabet signs from F to J",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { id: 3 },
    update: {},
    create: {
      categoryId: greetings.id,
      title: "Basic Greetings",
      description: "Learn signs for hello, goodbye, and welcome",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  const lesson4 = await prisma.lesson.upsert({
    where: { id: 4 },
    update: {},
    create: {
      categoryId: greetings.id,
      title: "Polite Expressions",
      description: "Learn thank you, please, sorry, and excuse me",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  const lesson5 = await prisma.lesson.upsert({
    where: { id: 5 },
    update: {},
    create: {
      categoryId: dailyWords.id,
      title: "Food and Drink",
      description: "Useful signs for food, water, tea, and bread",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  const lesson6 = await prisma.lesson.upsert({
    where: { id: 6 },
    update: {},
    create: {
      categoryId: dailyWords.id,
      title: "Common Needs",
      description: "Learn signs like help, bathroom, hospital, and phone",
      difficulty: "beginner",
      videoUrl: "",
    },
  });

  // Signs
  await prisma.sign.createMany({
    data: [
      { lessonId: lesson1.id, word: "A", meaningUz: "A harfi", imageUrl: "", videoUrl: "" },
      { lessonId: lesson1.id, word: "B", meaningUz: "B harfi", imageUrl: "", videoUrl: "" },
      { lessonId: lesson1.id, word: "D", meaningUz: "D harfi", imageUrl: "", videoUrl: "" },

      { lessonId: lesson2.id, word: "F", meaningUz: "F harfi", imageUrl: "", videoUrl: "" },
      { lessonId: lesson2.id, word: "G", meaningUz: "G harfi", imageUrl: "", videoUrl: "" },

      { lessonId: lesson3.id, word: "Hello", meaningUz: "Salom", imageUrl: "", videoUrl: "" },
      { lessonId: lesson3.id, word: "Goodbye", meaningUz: "Xayr", imageUrl: "", videoUrl: "" },

      { lessonId: lesson4.id, word: "Thank you", meaningUz: "Rahmat", imageUrl: "", videoUrl: "" },
      { lessonId: lesson4.id, word: "Please", meaningUz: "Iltimos", imageUrl: "", videoUrl: "" },

      { lessonId: lesson5.id, word: "Water", meaningUz: "Suv", imageUrl: "", videoUrl: "" },
      { lessonId: lesson5.id, word: "Bread", meaningUz: "Non", imageUrl: "", videoUrl: "" },

      { lessonId: lesson6.id, word: "Help", meaningUz: "Yordam", imageUrl: "", videoUrl: "" },
      { lessonId: lesson6.id, word: "Phone", meaningUz: "Telefon", imageUrl: "", videoUrl: "" },
    ],
    skipDuplicates: true,
  });

  // Quizzes
  await prisma.quiz.createMany({
    data: [
      {
        lessonId: lesson3.id,
        question: 'What is the meaning of the sign "Hello"?',
        optionA: "Rahmat",
        optionB: "Salom",
        optionC: "Xayr",
        optionD: "Non",
        correctAnswer: "B",
      },
      {
        lessonId: lesson5.id,
        question: 'Which word means "Suv"?',
        optionA: "Water",
        optionB: "Phone",
        optionC: "Help",
        optionD: "Bread",
        correctAnswer: "A",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data added successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });