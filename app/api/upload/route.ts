// app/api/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedPutUrl } from "@/lib/r2";
import { prisma } from "@/lib/prisma"; // ตรวจสอบ path ของ prisma ให้ถูกต้อง


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const contentType = searchParams.get("contentType");
 

  if (!key || !contentType) {
    return NextResponse.json({ error: "Missing key or contentType" }, { status: 400 });
  }

  const url = await generatePresignedPutUrl(key, contentType);

  return NextResponse.json({ url });
}

export async function POST(req: NextRequest) {
  try {
    const { name_song, audio_urlKey, uploaded_by, pictureKey } = await req.json();
    const userId = Number(uploaded_by);

    if (!name_song || !audio_urlKey || !userId || !pictureKey) {
      return NextResponse.json({ error: "Missing name_song, audio_urlKey, or uploaded_by" }, { status: 400 });
    }

    const newSong = await prisma.song.create({
      data: {
        name_song,
        audio_url: audio_urlKey,
        uploaded_by: userId,
        picture: pictureKey,
      },
      select: {
        id: true,
        name_song: true,
        audio_url: true,
        uploaded_by: true,
        created_at: true,
        picture: true,
      },
    });

    return NextResponse.json({ success: true, song: newSong });
  } catch (err: any) {
    console.error("Create song failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
