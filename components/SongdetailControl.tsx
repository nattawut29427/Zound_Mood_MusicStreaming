"use client";

import { usePlayer } from "@/app/context/Playercontext";
import { Song } from "@/components/types";
import { CirclePlay, PauseCircle } from "lucide-react";

type Props = {
  song: Song;
};

export default function SongDetailControls({ song }: Props) {
  const { currentTrack, isPlaying, resume, pause } = usePlayer();

  const isCurrentSongPlaying = isPlaying && currentTrack?.id === song.id;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  return (
    <div>
      {isCurrentSongPlaying ? (
        <PauseCircle
          onClick={handlePlayPause}
          className="w-9 h-9 text-blue-500 cursor-pointer transition-transform duration-200 scale-110"
        />
      ) : (
        <CirclePlay
          onClick={handlePlayPause}
          className="w-9 h-9 text-white hover:text-blue-500 cursor-pointer"
        />
      )}
    </div>
  );
}
