/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Nomall', 'Premuime');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'user';
