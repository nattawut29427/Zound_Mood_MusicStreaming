"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Howl } from "howler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Song } from "@/components/types";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import { Skeleton } from "@/components/ui/skeleton";

import {
  CirclePlay,
  PauseCircle,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";
import * as React from "react";

import { ScrollAreaHorizontalDemo } from "@/components/ui/ScrollAreaHorizontalDemo";

const audioUrlCache = new Map<string, { url: string; expires: number }>();

export default function Home() {
  const playlist = [
    { title: "Song 1", src: "/audio/song.mp3" },
    { title: "Song 2", src: "/audio/song2.mp3" },
  ];

  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const signedUrl = useSignedImage(currentTrack?.picture);

  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem("volume", newVolume.toString());
    if (sound) {
      sound.volume(newVolume);
    }
  };

  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);


  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Playsong อันนี้ไว้เล่นเพลงๆ เดียวจากที่เลือกเท่านั้น
  const playSong = async (song: Song) => {
    const key = song.audio_url;
    setCurrentTrack(song);

    if (sound) {
      sound.stop();
      sound.unload();
    }

    if (!key) {
      console.error("Missing audio_url in song");
      return;
    }

    // เช็ค cache
    const cached = audioUrlCache.get(key);
    const now = Date.now();

    let signedUrl: string;

    if (cached && cached.expires > now) {
      signedUrl = cached.url;
    } else {
      const res = await fetch(`/api/playsong?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error");
      }
      const data = await res.json();
      signedUrl = data.url;
      audioUrlCache.set(key, {
        url: signedUrl,
        expires: now + 4.5 * 60 * 1000, // เก็บไว้ 4.5 นาที
      });
    }

    const newSound = new Howl({
      src: [signedUrl],
      volume: volume,
      onload: () => {
        setDuration(newSound.duration());
        newSound.play();
        setIsPlaying(true);
      },
      onend: () => {
        setIsPlaying(false);
      },
    });

    setSound(newSound);
  };


  // เอาไว้เล่นเพลงจาก playlist
  const playSound = (index: number) => {
    if (sound) {
      sound.stop();
    }

    const newSound = new Howl({
      src: [playlist[index].src],
      volume: volume,
      onload: () => {
        setDuration(newSound.duration());
        newSound.play();
        setIsPlaying(true);
      },
      onend: () => {
        setIsPlaying(false);
      },
    });

    setSound(newSound);
  };

  const handlePlay = () => {
    if (sound) {
      sound.play();
      setIsPlaying(true);
    } else {
      playSound(currentIndex);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sound && isPlaying) {
      interval = setInterval(() => {
        const currentTime = sound.seek() as number;
        setPosition(currentTime);
      }, 500);
    }

    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (isPlaying) {
          handleStop();
        } else {
          handlePlay();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, sound]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseFloat(e.target.value);
    setPosition(newPos);
    if (sound) {
      sound.seek(newPos);
    }
  };

  const handleNext = () => {
    if (sound) {
      sound.stop();
    }
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSound(nextIndex);
  };

  const handleBefore = () => {
    if (sound) {
      sound.stop();
    }
    const nextIndex = (currentIndex - 1) % playlist.length;
    playSound(nextIndex);
  };

  const handleStop = () => {
    if (sound && sound.playing()) {
      sound.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-black h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="bg-black p-6 h-16 w-full sticky top-0 z-10 mb-4 flex items-center justify-between">
        <div className="text-white font-bold text-2xl ">
          <AuroraText>Logo</AuroraText>
        </div>
        <div className="flex-1 max-w-lg pt-2.5">
          <input
            type="text"
            placeholder="Type your song..."
            className="w-full h-12 px-4  rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button className="rounded-4xl cursor-pointer">Feed</Button>
          <div className="bg-white h-10 rounded-full w-1 bg-gradient-to-b from-red-500 to-pink-400"></div>
          <Button className="btn btn-primary ">Upload</Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full flex px-4 justify-between m-auto space-x-2 h-[calc(100vh-5rem)]">
        <div className="w-32 p-4 bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between">
          <div className="flex flex-col items-center justify-center gap-12 mt-8 text-white font-semibold text-sm">
            <div className="flex flex-col items-center cursor-pointer hover:text-gray-400 duration-200 gap-1">
              <ListMusic className="w-5 h-5" />
              <span>Play lists</span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-gray-400 duration-200">
              <Heart className="w-5 h-5" />
              <span>Like song</span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-gray-400 duration-200 ">
              <BookOpen className="w-5 h-5" />
              <span>Dairy</span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-gray-400 duration-200">
              <Bot className="w-5 h-5" />
              <span>Ai</span>
            </div>
            <div className="justify-center items-center mt-24 flex flex-col  text-center gap-1">
              <Settings className="w-5 h-5 text-white cursor-pointer " />
              <span>Settings</span>
            </div>
          </div>
          <div></div>
        </div>

        <div className="w-full p-10  overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-white h-full bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-lg flex flex-col justify-between">
          <div className="">
            <div className=" overflow-x-auto ">
              <ScrollAreaHorizontalDemo onSelect={playSong} />
            </div>
          </div>
          <div className="pt-2">
            <h1 className="text-white font-bold text-4xl">Topic</h1>
            <div className="mt-8 flex  ">
              <div
                className="items-start cursor-pointer space-x-4"
                onClick={handlePlay}
              >
                <Image
                  src="/2.jpg"
                  alt="cover"
                  width={128}
                  height={128}
                  className="rounded-md"
                />
                <div className="text-white">
                  <p className="font-semibold text-white">Song name</p>
                  <p className="text-xs text-gray-600">Artist name</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <h1 className="text-white font-bold text-4xl">Topic</h1>
            <div className="mt-8 flex  ">
              <div
                className="items-start cursor-pointer space-x-4"
                onClick={handlePlay}
              >
                <Image
                  src="/2.jpg"
                  alt="cover"
                  width={128}
                  height={128}
                  className="rounded-md"
                />
                <div className="text-white">
                  <p className="font-semibold text-white">Song name</p>
                  <p className="text-xs text-gray-600">Artist name</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-82    bg-gradient-to-t from-black from-[10%] to-[#252525]  shadow-lg flex flex-col justify-between">
          <div className="">3</div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-black fixed bottom-0 left-0 w-full z-50  flex items-center justify-between shadow-2xl p-4 h-20">
        {/* Left side */}
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
                  <p className="font-semibold">
                    {currentTrack.name_song || "Unknown Artist"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentTrack.uploader.username || "Untitled"}
                  </p>
                </div>
              </>
            ) : (
              <Skeleton className="h-12 bg-black w-12 rounded-md" />
            )
          ) : null}
        </div>

        <div className="w-full flex ">
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
            className="w-full h-1 m-auto   rounded-lg  appearance-none cursor-pointer"
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
        {/* Center controls */}
        <div className="flex items-center justify-center space-x-4 w-1/3">
          <Shuffle className="w-5 h-5 text-white hover:text-blue-500 cursor-pointer" />
          <SkipBack
            onClick={handleBefore}
            className="w-6 h-6 text-white hover:text-blue-500 cursor-pointer"
          />
          {isPlaying ? (
            <PauseCircle
              onClick={handleStop}
              className="w-9 h-9 text-blue-500 cursor-pointer transition-transform duration-200 scale-110"
            />
          ) : (
            <CirclePlay
              onClick={handlePlay}
              className="w-9 h-9 text-white hover:text-blue-500 cursor-pointer"
            />
          )}
          {/* ถ้าเล่นอยู่ให้ใช้ <Pause /> แทน */}
          <SkipForward
            onClick={handleNext}
            className="w-6 h-6 text-white hover:text-blue-500 cursor-pointer"
          />
          <Repeat className="w-5 h-5 text-white hover:text-blue-500 cursor-pointer" />
        </div>

        {/* Right volume */}
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
    </div>
  );
}
