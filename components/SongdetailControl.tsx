"use client";

import { usePlayer } from "@/app/context/Playercontext";
import { Song } from "@/components/types";
import { CirclePlay, PauseCircle } from "lucide-react";

type Props = {
  song: Song;
};

export default function SongDetailControls({ song }: Props) {
  const { currentTrack, isPlaying, resume, pause, playSong } = usePlayer();

  const isCurrentSong = currentTrack?.id === song.id;
  const isCurrentSongPlaying = isPlaying && isCurrentSong;


  const handleClick = () => {
    if (!isCurrentSong) {
      // ถ้าไม่ใช่เพลงปัจจุบัน → เปลี่ยนเพลง
      playSong(song);
    } else if (isPlaying) {
      // ถ้าเล่นอยู่ → หยุด
      pause();
    } else {
      // ถ้าเพลงนี้ใช่ และหยุดอยู่ → resume
      resume();
    }
  };

  return (
    <div>
      {isCurrentSongPlaying ? (
        <PauseCircle
          onClick={handleClick}
          className="w-12 h-12 text-violet-600 cursor-pointer transition-transform duration-200 scale-110"
        />
      ) : (
        <CirclePlay
          onClick={handleClick}
          className="w-12 h-12 text-white hover:text-violet-600 cursor-pointer"
        />
      )}
    </div>
  );
}
