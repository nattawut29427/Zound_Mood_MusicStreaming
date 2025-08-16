import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const diaryId = searchParams.get("diaryId");
  const session = await getServerSession(authOptions);

  if (!diaryId || !session?.user?.id) {
    return NextResponse.json({ liked: false, likes: 0, views: 0 });
  }

  const diaryIdInt = parseInt(diaryId);

  try {
    // ดึงเจ้าของไดอารีเพื่อตรวจสอบ
    const diary = await prisma.diary.findUnique({
      where: { id: diaryIdInt },
      select: { user_id: true },
    });

    if (!diary) {
      return NextResponse.json({ error: "Diary not found" }, { status: 404 });
    }

    // เช็คว่าผู้ดูเป็นเจ้าของหรือไม่
    const isOwner = session.user.id === diary.user_id;

    // ถ้าไม่ใช่เจ้าของ เพิ่มยอดวิว
    if (!isOwner) {
      await prisma.diaryStat.upsert({
        where: { diary_id: diaryIdInt },
        update: { view_count: { increment: 1 } },
        create: { diary_id: diaryIdInt, view_count: 1, like_count: 0 },
      });
    }

    // ตรวจสอบว่ากดไลค์ไปแล้วหรือยัง
    const existingLike = await prisma.diaryLike.findFirst({
      where: {
        diary_id: diaryIdInt,
        user_id: session.user.id,
      },
    });

    // ดึงจำนวนไลค์และวิวล่าสุด
    const [likesCount, diaryStat] = await Promise.all([
      prisma.diaryLike.count({ where: { diary_id: diaryIdInt } }),
      prisma.diaryStat.findUnique({ where: { diary_id: diaryIdInt } }),
    ]);

    const viewsCount = diaryStat?.view_count ?? 0;

    return NextResponse.json({
      liked: !!existingLike,
      likes: likesCount,
      views: viewsCount,
    });
  } catch (error) {
    console.error("Error fetching diary like/view info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
