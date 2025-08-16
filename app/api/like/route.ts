import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const likeSongs = await prisma.likeSong.findMany({
    where: {
      user_id: session.user.id, // กรองเฉพาะของ user นี้
    },
    include: {
      song: true, // รวมข้อมูลเพลงที่ถูกไลค์
    },
  });

  return NextResponse.json(likeSongs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const song_id = body.song_id;

  if (typeof song_id !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid song_id. Expected a number." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.likeSong.findUnique({
      where: {
        user_id_song_id: {
          user_id: session.user.id,
          song_id,
        },
      },
    });

    if (existing) {
      // 👎 Unlike
      await prisma.$transaction([
        prisma.likeSong.delete({
          where: {
            user_id_song_id: {
              user_id: session.user.id,
              song_id,
            },
          },
        }),
        prisma.songStat.update({
          where: { song_id },
          data: {
            like_count: { decrement: 1 },
          },
        }),
      ]);

      return NextResponse.json({ liked: false });
    } else {
      // 👍 Like
      await prisma.$transaction([
        prisma.likeSong.create({
          data: {
            user: { connect: { id: session.user.id } },
            song: { connect: { id: song_id } },
          },
        }),
        prisma.songStat.upsert({
          where: { song_id },
          update: { like_count: { increment: 1 } },
          create: {
            song_id,
            like_count: 1,
          },
        }),
      ]);

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
