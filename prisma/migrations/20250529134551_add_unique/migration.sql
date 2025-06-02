/*
  Warnings:

  - A unique constraint covering the columns `[audio_url]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Song_audio_url_key" ON "Song"("audio_url");
