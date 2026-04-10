/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `optionA` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `optionB` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `optionC` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `optionD` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `signId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Quiz` table. All the data in the column will be lost.
  - Made the column `title` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_signId_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "correctAnswer",
DROP COLUMN "optionA",
DROP COLUMN "optionB",
DROP COLUMN "optionC",
DROP COLUMN "optionD",
DROP COLUMN "question",
DROP COLUMN "signId",
DROP COLUMN "type",
ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "signId" INTEGER,
    "correctAnswer" TEXT,
    "optionsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_signId_fkey" FOREIGN KEY ("signId") REFERENCES "Sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
