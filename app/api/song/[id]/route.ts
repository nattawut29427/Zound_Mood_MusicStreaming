import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const songId = Number(params.id);
  const { name_song, description, picture, song_tags } = await req.json();

  if (!name_song || !song_tags || !picture) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        name_song,
        description,
        picture,
        song_tags: {
          deleteMany: {}, // ลบ tag เก่า
          create: song_tags.map((t: string) => ({
            tag: { connectOrCreate: { where: { name_tag: t }, create: { name_tag: t } } },
          })),
        },
      },
      include: { song_tags: { include: { tag: true } } },
    });

    return NextResponse.json(updatedSong);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const songId = Number(params.id);

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // หา shortSong ที่ผูกกับเพลง
    const shorts = await prisma.shortSong.findMany({ where: { songId } });
    for (const s of shorts) {
      if (s.trimmedR2Key) {
        await r2.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: s.trimmedR2Key,
        }));
      }
    }

    // หา diary ที่ผูกกับเพลง
    const diaries = await prisma.diary.findMany({ where: { song_id: songId } });
    for (const d of diaries) {
      if (d.trimmed_audio_url) {
        await r2.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: d.trimmed_audio_url,
        }));
      }
    }

    //  ลบความสัมพันธ์ทั้งหมด 
    await prisma.$transaction([
      prisma.songTag.deleteMany({ where: { song_id: songId } }),
      prisma.playlistSong.deleteMany({ where: { song_id: songId } }),
      prisma.likeSong.deleteMany({ where: { song_id: songId } }),
      prisma.feed.deleteMany({ where: { song_id: songId } }),
      prisma.feedItem.deleteMany({ where: { song_id: songId } }),
      prisma.listeningHistory.deleteMany({ where: { song_id: songId } }),
      prisma.songStat.deleteMany({ where: { song_id: songId } }),
      prisma.shortSong.deleteMany({ where: { songId } }),
      prisma.diary.updateMany({
        where: { song_id: songId },
        data: { song_id: null, song_removed: true },
      }),
    ]);

    // ลบเพลงหลัก 
    await prisma.song.delete({ where: { id: songId } });

    // ลบไฟล์ของเพลงหลักออกจาก R2 
    if (song.picture) {
      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: song.picture,
      }));
    }
    if (song.audio_url) {
      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: song.audio_url,
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}

