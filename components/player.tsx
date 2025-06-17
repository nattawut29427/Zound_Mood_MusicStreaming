"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CirclePlay,
  PauseCircle,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
} from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import { usePlayer } from "@/app/context/Playercontext";

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    seek,
    volume,
    setVolume,
    position,
    duration,
    isLooping,
    toggleLoop,
  } = usePlayer();

  const signedUrl = useSignedImage(currentTrack?.picture);

  useEffect(() => {
    const saved = localStorage.getItem("volume");
    if (saved) setVolume(parseFloat(saved));
  }, [setVolume]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseFloat(e.target.value);
    seek(newPos);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    localStorage.setItem("volume", newVol.toString());
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <footer className="bg-black fixed bottom-0 left-0 w-full z-50  flex items-center justify-between shadow-2xl p-2 h-20">
      {/* <Link href={"/viewsongs"} className="flex pl-4 w-1/3 "> */}
        <div className="flex items-center cursor-pointer space-x-4 w-1/3 pl-4">
          {currentTrack ? (
            signedUrl ? (
              <>
                <Image
                  src={signedUrl}
                  alt="cover"
                  width={48}
                  height={48}
                  className="rounded-md aspect-[4/4] object-cover"
                />
                <div className="text-white">
                  <p className="font-semibold">{currentTrack.name_song}</p>
                  <p className="text-xs text-gray-400">
                    {currentTrack.uploader?.name}
                  </p>
                </div>
              </>
            ) : (
              <Skeleton className="h-12 bg-black w-12 rounded-md" />
            )
          ) : (
            <div className="text-white text-sm italic"></div>
          )}
        </div>
      {/* </Link> */}

      <div className="w-full flex pr-4">
        <label className="block px-2 text-white text-sm font-medium mb-1">
          {formatTime(position)}
        </label>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={position}
          onChange={handleSeek}
          className="w-full h-1 m-auto rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffffff ${
              (position / duration) * 100
            }%, #6b7280 ${(position / duration) * 100}%)`,
            borderRadius: "999px",
          }}
        />
        <label className="block px-2 text-white text-sm font-medium mb-1">
          {formatTime(duration)}
        </label>
      </div>

      <div className="flex  items-center space-x-4 w-1/3 pr-4 ">
        <Shuffle className="w-5 h-5 text-white hover:text-blue-500 cursor-pointer" />
        <SkipBack className="w-6 h-6 text-white hover:text-blue-500 cursor-pointer" />
        {isPlaying ? (
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
        <SkipForward className="w-6 h-6 text-white hover:text-blue-500 cursor-pointer" />
        <Repeat
          onClick={toggleLoop}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            isLooping ? "text-blue-500" : "text-white"
          } hover:text-blue-500`}
        />
      </div>
      <div className="flex items-center justify-end space-x-2 w-1/3 pr-4">
        <Volume2 className="w-5 h-5 text-white" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-red-500 rounded-lg appearance-auto cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${
              (volume / 1) * 100
            }%, #6b7280 ${(volume / 1) * 100}%)`,
            borderRadius: "999px",
          }}
        />
      </div>
    </footer>
  );
}
