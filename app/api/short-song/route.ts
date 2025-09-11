import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/short-song?userId=...
// POST /api/short-song
// PUT /api/short-song/:id
// DELETE /api/short-song/:id

import { z } from "zod";

// Schema สำหรับ Short Song
const ShortSongSchema = z.object({
  userId: z.string(),
  songId: z.number(),
  trimmedR2Key: z.string(), // URL หรือ R2 Key ของ Short Song
  start: z.number(),
  duration: z.number(),
});

export async function GET(req: NextRequest) {
  try {
    const shortSongs = await prisma.shortSong.findMany({
      include: {
        song: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(shortSongs, { status: 200 });
  } catch (error) {
    console.error("Fetch short songs error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("POST /api/short-song - Request body:", body);

    const parsed = ShortSongSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error.format());
      return NextResponse.json(
        { message: "Invalid data", error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId, songId, trimmedR2Key, start, duration } = parsed.data;

    const shortSong = await prisma.shortSong.create({
      data: {
        userId: userId,
        songId: songId,
        trimmedR2Key: trimmedR2Key,
        start,
        duration,
      },
    });

    console.log("Created Short Song:", shortSong);
    return NextResponse.json(shortSong, { status: 201 });
  } catch (error) {
    console.error("Create Short Song error:", error);
    return NextResponse.json(
      { message: "Something went wrong.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, start, duration } = body;

    if (!id || start === undefined || duration === undefined) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.shortSong.update({
        where: { id },
        data: { start, duration }
    });

    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    await prisma.shortSong.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
}
