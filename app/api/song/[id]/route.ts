import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
