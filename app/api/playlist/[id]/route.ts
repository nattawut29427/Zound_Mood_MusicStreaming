

import { prisma } from "@/lib/prisma";


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const playlistId = Number(params.id);

  try {
    await prisma.$transaction([
      prisma.playlistSong.deleteMany({ where: { playlist_id: playlistId } }),
      prisma.feed.deleteMany({ where: { playlist_id: playlistId } }),
      prisma.playlist.delete({ where: { id: playlistId } }),
    ]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to delete playlist" }), { status: 500 });
  }
}
