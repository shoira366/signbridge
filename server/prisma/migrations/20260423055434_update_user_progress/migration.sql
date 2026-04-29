/*
  Warnings:

  - You are about to drop the column `score` on the `UserProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "score",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bestScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastScore" INTEGER NOT NULL DEFAULT 0;
