import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const songs = await prisma.song.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
        song_tags: {
          include: {
            tag: {
              select: {
                id: true,
                name_tag: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ songs });
  } catch (err: any) {
    console.error("Fetch songs failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
