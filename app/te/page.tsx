"use client";

import { useState, useEffect } from "react";
import { Howl } from "howler";

export default function HowlerDemoPage() {
  const playlist = [
    { title: "Song 1", src: "/audio/song.mp3" },
    { title: "Song 2", src: "/audio/song2.mp3" },
  ];

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
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  

  const playSound = (index: number) => {
    if (sound) {
      sound.stop();
    }

    const newSound = new Howl({
      src: [playlist[index].src],
      volume: volume,
      autoplay: true,
      onload: () => {
        setDuration(newSound.duration()); 
      },
      onend: () => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        playSound(nextIndex);
      },
    });

    setSound(newSound);
    setCurrentIndex(index);
    setIsPlaying(true);
    newSound.play();
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
    <div className="p-6 space-y-4 m-auto max-w-md ">
      <h1 className="text-2xl font-bold">Play music</h1>
      <p> กำลังเล่น: {playlist[currentIndex].title}</p>

      <div className="space-x-5">
        <button
          onClick={handlePlay}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isPlaying ? "กำลังเล่น..." : "เล่น"}
        </button>

        <button
          onClick={handleNext}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          เพลงถัดไป
        </button>

        <button
          onClick={handleBefore}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          เพลงก่อนหน้า
        </button>

        <button
          onClick={handleStop}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          หยุด
        </button>
        <div className="mt-4">
          <label htmlFor="volume" className="block text-sm font-medium mb-1">
            ระดับเสียง: {Math.round(volume * 100)}%
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            {formatTime(position)} / {formatTime(duration)}
          </label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={position}
            onChange={handleSeek}
            className="w-full"
          />
        </div>
      </div>
      <div className="badge badge-soft badge-primary">Primary</div>
<div className="badge badge-soft badge-secondary">Secondary</div>
<div className="badge badge-soft badge-accent">Accent</div>
<div className="badge badge-soft badge-info">Info</div>
<div className="badge badge-soft badge-success">Success</div>
<div className="badge badge-soft badge-warning">Warning</div>
<div className="badge badge-soft badge-error">Error</div>
    </div>
  );
}
