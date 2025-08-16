// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedPutUrl } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

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
    const body = await req.json();
    console.log("Received body:", body);

    const {
      name_song,
      audio_urlKey,
      uploaded_by,
      pictureKey,
      tag,
      description,
    } = body;


    if (!name_song || !audio_urlKey || !uploaded_by || !pictureKey || !tag || !description) {

      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSong = await prisma.song.create({
      data: {
        name_song,
        audio_url: audio_urlKey,
        uploaded_by,
        picture: pictureKey,
        description: description,
      },
      select: {
        id: true,
        name_song: true,
        audio_url: true,
        uploaded_by: true,
        created_at: true,
        picture: true,
        description: true, 
      },
    });

    console.log("New song created:", newSong);

    if (tag) {
      const tagList = tag.split(",").map((t: string) => t.trim());

      for (const tagName of tagList) {
        let tagId: number;
        const existingTag = await prisma.tag.findUnique({
          where: { name_tag: tagName },
        });

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const newTag = await prisma.tag.create({
            data: { name_tag: tagName },
          });
          tagId = newTag.id;
        }

        await prisma.songTag.create({
          data: {
            song_id: newSong.id,
            tag_id: tagId,
          },
        });
      }
    }

    return NextResponse.json({ success: true, song: newSong });
  } catch (err: any) {
    console.error("Create song failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

