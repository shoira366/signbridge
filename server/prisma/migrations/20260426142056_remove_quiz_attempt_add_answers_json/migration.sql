/*
  Warnings:

  - You are about to drop the `QuizAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "answersJson" JSONB;

-- DropTable
DROP TABLE "QuizAttempt";
