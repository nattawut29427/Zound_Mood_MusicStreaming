import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // ดึง session ของผู้ใช้ปัจจุบัน
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // รวมยอดการฟังของเพลงที่ user เป็นเจ้าของ
    const totalPlays = await prisma.songStat.aggregate({
      _sum: { play_count: true },
      where: {
        song: {
          is: {
            uploaded_by: userId,
          },
        },
      },
    });

    // รวมยอด Like ของเพลงที่ user เป็นเจ้าของ
    const totalLikes = await prisma.songStat.aggregate({
      _sum: { like_count: true },
      where: {
        song: {
          is: {
            uploaded_by: userId,
          },
        },
      },
    });

    // จำนวนผู้ติดตามของ user
    const totalFollowers = await prisma.follow.count({
      where: { followed_user_id: userId },
    });



    const topSongForCard = await prisma.song.findFirst({
      where: {
        uploaded_by: userId,
        stat: { isNot: null }, 
      },
      orderBy: { stat: { play_count: "desc" } },
      select: {
        picture: true,
        name_song: true,
        stat: { select: { play_count: true } },
      },
    })




    // ดึงเพลงทั้งหมดของ user เรียงตามยอดฟัง
    const topSongs = await prisma.song.findMany({
      where: { uploaded_by: userId },
      orderBy: {
        stat: {
          play_count: "desc",
        },
      },
      select: {
        id: true,
        name_song: true,
        picture: true,
        stat: {
          select: {
            play_count: true,
            like_count: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalPlays: totalPlays._sum.play_count || 0,
      totalLikes: totalLikes._sum.like_count || 0,
      totalFollowers,
      topSongs,
      topSongForCard,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
