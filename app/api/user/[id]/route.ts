// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params; // ไม่ต้อง await params
  if (!id) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      songs: {
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      playlists: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          playlist_songs: {
            include: {
              song: {
                include: {
                  uploader: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      listeningHistories: true,
      likesongs: {
        include: {
          song: {
            include: {
              uploader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profileKey: user.image,
    username: user.name,
    songs: user.songs,
    playlists: user.playlists,
    likesongs: user.likesongs,
    listeningHistories: user.listeningHistories,
  });
}
