import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    let followedFeed: any[] = [];

    if (session?.user?.id) {
      // หา user ที่ผู้ใช้กำลังติดตาม
      const followedUsers = await prisma.follow.findMany({
        where: { following_user_id: session.user.id },
        select: { followed_user_id: true },
      });

      const followedIds = followedUsers.map((f) => f.followed_user_id);

      // หาเพลงของคนที่เราติดตาม
      const followedSongs = await prisma.song.findMany({
        where: {
          uploaded_by: {
            in: followedIds,
          },
        },
        include: {
          uploader: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 10,
      });

      followedFeed = [
        {
          id: 0,
          title: "Your follow",
          description: "Songs uploaded by people you follow",
          feed_items: followedSongs.map((song) => ({
            id: song.id,
            order_index: 0,
            song: song,
          })),
        },
      ];
    }

    // ดึง section ปกติทั้งหมด
    const sections = await prisma.feedSection.findMany({
      include: {
        feed_items: {
          include: {
            song: {
              include: {
                uploader: true,
              },
            },
          },
        },
      },
    });

    // รวมทั้ง 2 ส่วน
    const allSections = [...followedFeed, ...sections];

    return NextResponse.json({ sections: allSections });
  } catch (err: any) {
    console.error("Fetch sections failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
