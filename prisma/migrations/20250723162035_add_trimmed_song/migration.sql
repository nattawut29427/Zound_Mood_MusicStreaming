/*
  Warnings:

  - Added the required column `trimmed_audio_url` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "trimmed_audio_url" TEXT NOT NULL;
