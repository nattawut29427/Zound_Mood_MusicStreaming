/*
  Warnings:

  - You are about to drop the column `description` on the `Diary` table. All the data in the column will be lost.
  - Added the required column `content` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diary" DROP COLUMN "description",
ADD COLUMN     "content" JSONB NOT NULL;
