// /api/search.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q) return NextResponse.json({ songs: [] });

    const songs = await prisma.song.findMany({
        where: {
            OR: [
                { name_song: { contains: q, mode: "insensitive" } },
                { uploader: { name: { contains: q, mode: "insensitive" } } }, // ใช้ relation uploader.name
                {
                    song_tags: {
                        some: {
                            tag: {
                                name_tag: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                },
            ],
        },
        include: {
            uploader: true, // เพื่อดึงข้อมูล user ที่อัปโหลด
            song_tags: { include: { tag: true } }, // เพื่อดึง tag
        },
        take: 10,
    });


    return NextResponse.json({ songs });
}
