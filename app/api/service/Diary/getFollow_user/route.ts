import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // ดึงรายชื่อผู้ที่เรา follow
    const following = await prisma.follow.findMany({
      where: { following_user_id: session.user.id },
      select: { followed_user_id: true },
    });
    const followingIds = following.map(f => f.followed_user_id);

    const diaries = await prisma.diary.findMany({
      where: {
        OR: [
          { user_id: { in: followingIds } }, // ของคนที่เรา follow
          { is_private: false },             // diary public
        ],
      },
      include: {
        user: true,
        song: true,
        diary_like: true,
        stat: true,
      },
      orderBy: { created_at: "desc" },
    });

    return new Response(JSON.stringify({ diaries }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch diaries" }), { status: 500 });
  }
}
