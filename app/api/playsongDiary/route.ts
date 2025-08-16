import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedGetUrl } from "@/lib/r2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// สำหรับเล่นเพลงจากไดอารี่ และเพิ่ม view
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const url = await generatePresignedGetUrl(key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// สำหรับเพิ่ม view หรือ like
export async function POST(req: NextRequest) {
  const { diaryId, action } = await req.json();
  const session = await getServerSession(authOptions);

  if (!diaryId || !action) {
    return NextResponse.json(
      { error: "Missing diaryId or action" },
      { status: 400 }
    );
  }

  const parsedDiaryId = parseInt(diaryId);
  if (isNaN(parsedDiaryId)) {
    return NextResponse.json({ error: "Invalid diaryId" }, { status: 400 });
  }

  const userId = session?.user?.id;

  try {
    if (action === "view") {
      // ดึงข้อมูลไดอารี่จาก DB เพื่อเช็คเจ้าของ
      const diary = await prisma.diary.findUnique({
        where: { id: parsedDiaryId },
        select: { user_id: true },
      });

      if (!diary) {
        return NextResponse.json({ error: "Diary not found" }, { status: 404 });
      }

      // ถ้าผู้ใช้เป็นเจ้าของ ไม่เพิ่มยอดวิว
      if (session?.user?.id === diary.user_id) {
        return NextResponse.json({
          success: true,
          message: "Owner view, no increment",
        });
      }

      // เพิ่มยอดวิวเฉพาะผู้ที่ไม่ใช่เจ้าของ
      await prisma.diaryStat.upsert({
        where: { diary_id: parsedDiaryId },
        update: { view_count: { increment: 1 } },
        create: { diary_id: parsedDiaryId, view_count: 1, like_count: 0 },
      });

      return NextResponse.json({ success: true });
    }
    if (action === "like") {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // ตรวจสอบว่ากด like ไปแล้วหรือยัง
      const alreadyLiked = await prisma.diaryLike.findUnique({
        where: {
          diary_id_user_id: {
            diary_id: parsedDiaryId,
            user_id: userId,
          },
        },
      });

      if (alreadyLiked) {
        return NextResponse.json({ liked: true }); // กด like ไปแล้ว
      }

      // ยังไม่เคย like มาก่อน
      await prisma.diaryLike.create({
        data: {
          diary_id: parsedDiaryId,
          user_id: userId,
        },
      });

      await prisma.diaryStat.upsert({
        where: { diary_id: parsedDiaryId },
        update: { like_count: { increment: 1 } },
        create: { diary_id: parsedDiaryId, view_count: 0, like_count: 1 },
      });

      return NextResponse.json({ liked: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating diary stat:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
