//recommend next_song api
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");

  if (!songId) {
    return NextResponse.json({ error: "songId required" }, { status: 400 });
  }

  try {
    const currentSong = await prisma.song.findUnique({
      where: { id: Number(songId) },
      include: { song_tags: true },
    });

    if (!currentSong) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const tagIds = currentSong.song_tags.map(t => t.tag_id);

    // หาเพลงอื่นทั้งหมด (ยกเว้นเพลงปัจจุบัน)
    let candidates = await prisma.song.findMany({
      where: { id: { not: currentSong.id } },
      include: { song_tags: true },
      take: 100,
    });

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No other songs" }, { status: 404 });
    }

    // สร้าง weighted list โดยนับ tag ตรงกัน (weight = 1 + matchCount)
    const weightedList: typeof candidates = [];
    candidates.forEach(song => {
      const matchCount = song.song_tags.filter(t => tagIds.includes(t.tag_id)).length;
      for (let i = 0; i < 1 + matchCount; i++) {
        weightedList.push(song);
      }
    });

    let nextSong = weightedList[Math.floor(Math.random() * weightedList.length)];

    // เพิ่ม safety: ถ้า nextSong.id = currentSong.id ให้สุ่มใหม่
    if (nextSong.id === currentSong.id && weightedList.length > 1) {
      nextSong = weightedList.find(s => s.id !== currentSong.id)!;
    }

    return NextResponse.json(nextSong);

  } catch (error) {
    console.error("Error in recommend-next:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
