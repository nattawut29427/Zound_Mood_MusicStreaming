// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // เช็คว่า user login ไหม (ถ้าอยากเปิดให้ทุกคนเข้าดูก็ลบไ
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ดึง user ตาม params.id (ไม่ใช่ session.user.id)
  const user = await prisma.user.findUnique({
    where: { id },
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

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await req.json();
  const { name, image, bg_image } = body; 

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        image: image || undefined,
        bg_image: bg_image || undefined,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        image: updatedUser.image,
        bg:updatedUser.bg_image ?? null,
      },
    });
  } catch (err) {
    console.error("Update user failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}