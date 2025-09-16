import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedGetUrl } from "@/lib/r2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const log = searchParams.get("log") === "true";

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    // ตรวจสอบ Song / Playlist / ShortSong
    const song = await prisma.song.findFirst({
      where: { OR: [{ picture: key }, { audio_url: key }] },
    });

    const playlist = await prisma.playlist.findFirst({
      where: { pic_playlists: key },
    });

    const shortSong = await prisma.shortSong.findFirst({
      where: { trimmedR2Key: key },
    });

    if (!song && !playlist && !shortSong) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ถ้า log สำหรับเพลงเต็ม
    if (log && userId && song) {
      const existing = await prisma.listeningHistory.findFirst({
        where: {
          user_id: userId,
          song_id: song.id,
          listened_at: { gte: new Date(Date.now() - 1000 * 60 * 5) },
        },
      });

      if (!existing) {
        await prisma.listeningHistory.create({
          data: { user_id: userId, song_id: song.id },
        });
      }
    }

    let url: string;

    if (shortSong) {
      // สำหรับ short song
      url = await generatePresignedGetUrl(shortSong.trimmedR2Key);
    } else if (key.startsWith("http")) {
      url = key; // external URL
    } else {
      url = await generatePresignedGetUrl(key); // R2 key
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Play log error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  const { songId, action } = await req.json();
  const session = await getServerSession(authOptions);

  if (!songId || !action) {
    return NextResponse.json(
      { error: "Missing songId or action" },
      { status: 400 }
    );
  }

  const parsedSongId = parseInt(songId);
  if (isNaN(parsedSongId)) {
    return NextResponse.json({ error: "Invalid songId" }, { status: 400 });
  }

  const userId = session?.user?.id;

  try {
    if (action === "view") {
      const song = await prisma.song.findUnique({
        where: { id: parsedSongId },
        select: { uploaded_by: true },
      });

      if (!song) {
        return NextResponse.json({ error: "Song not found" }, { status: 404 });
      }

      // แปลง type ให้ตรงกัน (uploaded_by เป็น String)
      if (userId && userId === song.uploaded_by) {
        return NextResponse.json({
          success: true,
          message: "Owner view, no increment",
        });
      }

      console.log("Incrementing play_count for songId:", parsedSongId);

      const stat = await prisma.songStat.upsert({
        where: { song_id: parsedSongId }, // ใช้ key ตรงๆ ได้
        update: { play_count: { increment: 1 } },
        create: { song_id: parsedSongId, play_count: 1, like_count: 0 },
      });

      console.log("Updated stat:", stat);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating song stat:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

