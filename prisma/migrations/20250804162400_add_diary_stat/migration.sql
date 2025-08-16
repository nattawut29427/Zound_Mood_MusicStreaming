-- CreateTable
CREATE TABLE "DiaryStat" (
    "diary_id" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DiaryStat_pkey" PRIMARY KEY ("diary_id")
);

-- AddForeignKey
ALTER TABLE "DiaryStat" ADD CONSTRAINT "DiaryStat_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
