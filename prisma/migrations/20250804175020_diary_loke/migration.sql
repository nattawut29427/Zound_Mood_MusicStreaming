-- CreateTable
CREATE TABLE "DiaryLike" (
    "id" SERIAL NOT NULL,
    "diary_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "DiaryLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaryLike_diary_id_user_id_key" ON "DiaryLike"("diary_id", "user_id");

-- AddForeignKey
ALTER TABLE "DiaryLike" ADD CONSTRAINT "DiaryLike_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryLike" ADD CONSTRAINT "DiaryLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
