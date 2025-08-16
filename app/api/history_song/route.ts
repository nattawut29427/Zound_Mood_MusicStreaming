import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // ถ้าต้องการให้ล็อกอินก่อนเข้าถึง
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ดึง listening history ของ user นี้ (ถ้าต้องการจำกัดเฉพาะ user)
    const rawHistory = await prisma.listeningHistory.findMany({
      where: { user_id: session.user.id },
      include: { song: true },
      orderBy: { listened_at: "desc" },
    });

    const uniqueMap = new Map();
    for (const item of rawHistory) {
      if (!uniqueMap.has(item.song.id)) {
        uniqueMap.set(item.song.id, item);
      }
    }
    const uniqueHistory = Array.from(uniqueMap.values());
    return NextResponse.json({ history: uniqueHistory });
  } catch (error) {
    console.error("Error fetching listening history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
