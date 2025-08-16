-- CreateTable
CREATE TABLE "ListeningHistory" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "song_id" INTEGER NOT NULL,
    "listened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongStat" (
    "song_id" INTEGER NOT NULL,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SongStat_pkey" PRIMARY KEY ("song_id")
);

-- CreateIndex
CREATE INDEX "ListeningHistory_user_id_song_id_idx" ON "ListeningHistory"("user_id", "song_id");

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongStat" ADD CONSTRAINT "SongStat_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
