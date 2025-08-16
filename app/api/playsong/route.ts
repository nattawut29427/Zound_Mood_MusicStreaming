import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedGetUrl } from "@/lib/r2";
import { getServerSession } from "next-auth"; // ถ้าใช้ auth
import { authOptions } from "@/lib/auth";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const log = searchParams.get("log") === "true";

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const session = await getServerSession(authOptions); // ดึง user session ถ้ามี
  const userId = session?.user?.id;

  try {
    const song = await prisma.song.findFirst({
      where: {
        OR: [{ picture: key }, { audio_url: key }],
      },
    });

    const playlist = await prisma.playlist.findFirst({
      where: {
        pic_playlists: key,
      },
    });

    if (!song && !playlist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (log && userId) {
      // บันทึก history ถ้าไม่มี record ซ้ำใน 5 นาที
      if (song) {
        const existing = await prisma.listeningHistory.findFirst({
          where: {
            user_id: userId,
            song_id: song.id,
            listened_at: {
              gte: new Date(Date.now() - 1000 * 60 * 5),
            },
          },
        });

        if (!existing) {
          await prisma.listeningHistory.create({
            data: {
              user_id: userId,
              song_id: song.id,
            },
          });
        }
      }
    }

    const url = await generatePresignedGetUrl(key);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Play log error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
