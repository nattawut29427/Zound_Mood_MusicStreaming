import { prisma } from "@/lib/prisma";
import PlaylistCover from "@/components/PlaylistCover";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SongCover from "@/components/Songcover";

export default async function SongDetailPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-white">Unauthorized</div>;
  }

  const playlists = await prisma.playlist.findMany({
    where: {
      user_id: userId,
    },
    include: {
      playlist_songs: true,
      user: true,
    },
  });

  if (!playlists || playlists.length === 0) {
    return <div className="text-white">No playlists found</div>;
  }

  return (
    <>
    <div className="p-10 space-y-10">
      <h1 className="text-white font-bold text-4xl">Your Playlists</h1>
    </div>
    <div className="grid lg:grid-cols-6 px-10 gap-x-10 gap-y-6">
      {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/you/playlists/${playlist.id}`}>
          <div className="rounded-lg cursor-pointer hover:opacity-80 transition p-2">
            <SongCover
              picture={playlist.pic_playlists ?? ""}
              name={playlist.name_playlist}
              
              />
            <figcaption className="pt-2 text-xs text-muted-foreground">
              <span className="font-bold text-md text-white">
                {playlist.name_playlist}
              </span>
              <p className="text-md font-semibold text-muted-foreground">
                By : {playlist.user.name}
              </p>
            </figcaption>
          </div>
        </Link>
      ))}
    </div>
    </>
  );
}
