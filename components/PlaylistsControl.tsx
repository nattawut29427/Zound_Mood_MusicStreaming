// components/PlaylistDetailControls.tsx
"use client";

import React from "react";
import { Heart,  Shuffle, CirclePlay, PauseCircle} from "lucide-react"; // เพิ่ม PauseCircle
import { usePlayer } from "@/app/context/Playercontext";
import { Song } from "@/components/types";

interface PlaylistDetailControlsProps {
  playlistId: number;
  playlistName: string;
  playlistPicture: string;
  creatorName: string;
  songs: Song[];
}

export default function PlaylistDetailControls({
  songs,
}: PlaylistDetailControlsProps) {
  const { currentTrack, isPlaying, playQueue, pause, queue, resume } =
    usePlayer();

  const isThisPlaylistLoadedInQueue =
    songs.length > 0 && // ตรวจสอบว่า Playlist ที่แสดงมีเพลง
    queue.length > 0 && // ตรวจสอบว่าคิวของ Player มีเพลง
    queue.length === songs.length && // ตรวจสอบว่าจำนวนเพลงในคิวเท่ากับใน Playlist นี้
    queue[0]?.id === songs[0]?.id && // ตรวจสอบว่าเพลงแรกในคิวคือเพลงแรกของ Playlist นี้
    queue[queue.length - 1]?.id === songs[songs.length - 1]?.id; // ตรวจสอบว่าเพลงสุดท้ายในคิวคือเพลงสุดท้ายของ Playlist นี้

  // ฟังก์ชันสำหรับจัดการการกดปุ่ม Play/Pause
  const handlePlayAll = () => {
    if (songs.length === 0) {
      console.warn("Playlist is empty. Cannot play.");
      return;
    }

    if (isThisPlaylistLoadedInQueue) {
      // กรณีที่ 1: Playlist นี้ถูกโหลดอยู่ในคิวของ Player แล้ว
      if (isPlaying) {
        // ถ้าระบบกำลังเล่นเพลงอยู่ (และเพลงนั้นมาจาก Playlist นี้) --> หยุดชั่วคราว
        pause();
      } else {
        // ถ้าระบบหยุดเล่นเพลงอยู่ (และเพลงนั้นมาจาก Playlist นี้) --> เล่นต่อ
        resume();
      }
    } else {
      // กรณีที่ 2: Playlist นี้ยังไม่ได้อยู่ในคิวของ Player
      // หรือมี Playlist/เพลงอื่นกำลังเล่น/หยุดอยู่
      // --> เริ่มเล่น Playlist นี้ใหม่จากต้น
      playQueue(songs, 0);
    }
  };

  // Logic สำหรับแสดงไอคอน Play/Pause
  // จะแสดงไอคอน Pause ก็ต่อเมื่อ Playlist นี้ถูกโหลดและกำลังเล่นอยู่
  const showPauseIcon = isThisPlaylistLoadedInQueue && isPlaying;

  const handleShufflePlay = () => {
    if (songs.length === 0) return;

    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    playQueue(shuffledSongs, 0); // เริ่มเล่น Playlist แบบสุ่ม
  };

  return (
    <div className="flex items-center space-x-4">
      {/* ปุ่ม Play/Pause Playlist */}
      <button
        onClick={handlePlayAll}
        className={`
    flex items-center justify-center
    p-3 rounded-full
    text-white
    transition-colors
    
    ${
      songs.length === 0
        ? " cursor-not-allowed"
        : ""
    }
  `}
        aria-label={
          isThisPlaylistLoadedInQueue && isPlaying
            ? "Pause playlist"
            : "Play playlist"
        }
        disabled={songs.length === 0}
      >
        {isThisPlaylistLoadedInQueue && isPlaying ? (
          <PauseCircle className="w-12 h-12  text-blue-500 cursor-pointer transition-transform duration-200 scale-110"  />
        ) : (
          <CirclePlay  className="w-12 h-12 text-blue-500 cursor-pointer transition-transform duration-200 scale-110"/>
        )}
      </button>

      {/* ปุ่ม Shuffle Playlist */}
      <button
        onClick={handleShufflePlay}
        className="flex items-center justify-center p-3 rounded-full bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
        aria-label="Shuffle play"
        disabled={songs.length === 0}
      >
        <Shuffle className="w-6 h-6" />
      </button>

      {/* ปุ่ม Like/Heart (ตัวอย่าง) */}
      <button
        className="flex items-center justify-center p-3 rounded-full bg-neutral-700 text-white hover:bg-red-500 transition-colors"
        aria-label="Like playlist"
      >
        <Heart className="w-6 h-6" />
      </button>
    </div>
  );
}
