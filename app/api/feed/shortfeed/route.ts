import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shortsongs = await prisma.shortSong.findMany({
      take: 10, // เอาแค่ 10 เพลงล่าสุด
      orderBy: { createdAt: "desc" },
      include: {
        song: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ shortsongs });
  } catch (error) {
    console.error("Error fetching short song feed:", error);
    return NextResponse.json({ error: "Failed to load short song feed" }, { status: 500 });
  }
}
