import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playlists = await prisma.playlist.findMany({
    where: {
      user_id: session.user.id, // กรองเฉพาะของ user นี้
    },
    include: {
      playlist_songs: {
        include: {
          song: true,
        },
      },
    },
  });

  return NextResponse.json(playlists);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json();
  const { name_playlist, picture ,song } = body;

  if (!name_playlist || !picture || !song   || !Array.isArray(song)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }


  const playlist = await prisma.playlist.create({
    data: {
      name_playlist,
      pic_playlists: picture,
      user_id: session.user.id,
      playlist_songs: {
        create: song.map((songId: number) => ({
          song: {
            connect: { id: songId },
          },
        })),
      },
    },
    include: {
      playlist_songs: {
        include: {
          song: true,
        },
      },
    },
  });
  

  return NextResponse.json(playlist);
}
