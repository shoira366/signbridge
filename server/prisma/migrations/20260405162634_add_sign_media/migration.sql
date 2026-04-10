/*
  Warnings:

  - Made the column `meaningUz` on table `Sign` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Sign" DROP CONSTRAINT "Sign_lessonId_fkey";

-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "meaningUz" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
