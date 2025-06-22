/*
  Warnings:

  - A unique constraint covering the columns `[name_tag]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name_playlist` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_playlists` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "name_playlist" TEXT NOT NULL,
ADD COLUMN     "pic_playlists" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_tag_key" ON "Tag"("name_tag");
