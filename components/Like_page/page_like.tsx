"use client";

import SongCover from "@/components/Songcover";
import Link from "next/link";
import { usePlayer } from "@/app/context/Playercontext";

export default function LikedSongsClient({
  likedSongs,
}: {
  likedSongs: any[];
}) {
  const { playSong, stop, currentTrack, isPlaying } = usePlayer();

  if (!likedSongs || likedSongs.length === 0) {
    return <div className="text-white">You haven’t liked any songs yet.</div>;
  }

  return (
    <>
      <div className="p-10 space-y-10">
        <h1 className="text-white font-bold text-4xl">Liked Songs</h1>
      </div>
      <div className="grid lg:grid-cols-6 gap-4 px-10">
        {likedSongs.map((like) => {
          const song = like.song;
          const songIsPlaying = currentTrack?.id === song.id && isPlaying;

          return (
            <Link
              key={song.id}
              href={`/viewsongs/${song.id}`}
              className="block rounded-lg hover:opacity-80 transition"
            >
              <div className="p-2">
                <SongCover
                  picture={song.picture ?? ""}
                  name={song.name_song}
                  isPlaying={songIsPlaying}
                  onPlayClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playSong(song);
                  }}
                  onPauseClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    stop();
                  }}
                />
                <figcaption className="pt-2 text-xs text-muted-foreground">
                  <span className="font-bold text-md text-white">
                    {song.name_song}
                  </span>
                  <p className="text-md font-semibold text-muted-foreground">
                    By: {song.uploader?.name ?? "Unknown"}
                  </p>
                </figcaption>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
