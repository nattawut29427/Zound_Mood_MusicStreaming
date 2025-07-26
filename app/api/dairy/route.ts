import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DiarySchema = z.object({
  name_diary: z.string().min(1),
  content: z.any(),
  song_id: z.number(),
  trimmed_audio_url: z.string().url(),
  user_id: z.string(),
  is_private: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("POST /api/diary - Request body:", body);

    const parsed = DiarySchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error.format());
      return NextResponse.json(
        { message: "Invalid data", error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name_diary, content, song_id, user_id, is_private, trimmed_audio_url } = parsed.data;
    console.log("Validated data:", parsed.data);

    const diary = await prisma.diary.create({
      data: {
        name_diary,
        content,
        trimmed_audio_url,
        song_id,
        user_id,
        is_private,
      },
    });

    console.log("Created diary:", diary);
    return NextResponse.json(diary, { status: 201 });
  } catch (error) {
    console.error("Create diary error:", error);
    return NextResponse.json(
      { message: "Something went wrong.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const diaries = await prisma.diary.findMany({
      include: {
        song: true,
        user: true,
      },
      orderBy: {
        created_at: "desc", // เรียงใหม่ล่าสุดอยู่บน
      },
    });

    return NextResponse.json({ diaries });
  } catch (err) {
    console.error("Fetch diaries failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}