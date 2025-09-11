-- DropForeignKey
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_song_id_fkey";

-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "song_removed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "song_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;
