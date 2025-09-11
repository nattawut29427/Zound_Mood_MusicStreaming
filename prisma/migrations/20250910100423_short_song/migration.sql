-- CreateTable
CREATE TABLE "ShortSong" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,
    "trimmedR2Key" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortSong_pkey" PRIMARY KEY ("id")
);
