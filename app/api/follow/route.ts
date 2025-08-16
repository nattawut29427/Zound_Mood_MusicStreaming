import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, follow } = await req.json();

  if (!userId || typeof follow !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (follow) {
      await prisma.follow.create({
        data: {
          following_user_id: session.user.id, // ผู้ที่กดติดตาม
          followed_user_id: userId, // ผู้ที่ถูกติดตาม
        },
      });
    } else {
      await prisma.follow.delete({
        where: {
          following_user_id_followed_user_id: {
            following_user_id: session.user.id,
            followed_user_id: userId,
          },
        },
      });
    }

    const followedUsers = await prisma.follow.findMany({
      where: { following_user_id: session.user.id },
      select: { followed_user_id: true },
    });

    const followedUserIds = followedUsers.map((f) => f.followed_user_id);

    return NextResponse.json({ success: true, following: follow });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
