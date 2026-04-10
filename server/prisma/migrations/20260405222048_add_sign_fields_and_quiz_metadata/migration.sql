/*
  Warnings:

  - A unique constraint covering the columns `[lessonId,word]` on the table `Sign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "signId" INTEGER,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'multiple_choice';

-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "description" TEXT,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Sign_lessonId_word_key" ON "Sign"("lessonId", "word");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_signId_fkey" FOREIGN KEY ("signId") REFERENCES "Sign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
