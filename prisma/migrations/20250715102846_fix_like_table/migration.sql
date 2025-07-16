/*
  Warnings:

  - A unique constraint covering the columns `[user_id,song_id]` on the table `LikeSong` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LikeSong_user_id_song_id_key" ON "LikeSong"("user_id", "song_id");
