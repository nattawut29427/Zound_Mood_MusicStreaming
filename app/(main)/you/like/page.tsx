import { prisma } from "@/lib/prisma";
import SongCover from "@/components/Songcover"; // ✅ ใช้แทน PlaylistCover
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function LikedSongsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-white">Unauthorized</div>;
  }

  const likedSongs = await prisma.likeSong.findMany({
    where: { user_id: userId },
    include: {
      song: {
        include: {
          uploader: true,
        },
      },
    },
  });

  if (!likedSongs || likedSongs.length === 0) {
    return <div className="text-white">You haven’t liked any songs yet.</div>;
  }

  return (
    <>
      <div className="p-10 space-y-10">
        <h1 className="text-white font-bold text-4xl">Liked Songs</h1>
      </div>
      <div className="grid lg:grid-cols-6 gap-4 px-10 space-y-10">
        {likedSongs.map((like) => (
          <Link key={like.song.id} href={`/song/${like.song.id}`}>
            <div className="rounded-lg cursor-pointer hover:opacity-80 transition p-2">
              <SongCover
                picture={like.song.picture ?? ""}
                name={like.song.name_song}
              />
              <figcaption className="pt-2 text-xs text-muted-foreground">
                <span className="font-bold text-md text-white">
                  {like.song.name_song}
                </span>
                <p className="text-md font-semibold text-muted-foreground">
                  By: {like.song.uploader?.name ?? "Unknown"}
                </p>
              </figcaption>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
