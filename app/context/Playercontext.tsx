// app/context/Playercontext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Howl } from "howler";
import { Song } from "@/components/types";

type PlayerContextType = {
  currentTrack: Song | null;
  isPlaying: boolean;
  volume: number;
  position: number;
  duration: number;
  isLooping: boolean;
  playSong: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  seek: (pos: number) => void;
  setVolume: (vol: number) => void;
  toggleLoop: () => void;
};

export const PlayerContext = createContext<PlayerContextType>(
  {} as PlayerContextType
);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) {
        setPosition(sound.seek() as number);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  // สำหรับ เล่นเพลง
  const playSong = async (song: Song) => {
    setCurrentTrack(song);
    if (sound) {
      sound.stop();
      sound.unload();
    }

    const res = await fetch(
      `/api/playsong?key=${encodeURIComponent(song.audio_url)}`
    );
    const { url } = await res.json();

    const newSound = new Howl({
      src: [url],
      volume,
      onload: () => {
        setDuration(newSound.duration());
        newSound.play();
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onend: () => {
        setIsPlaying(false);
        if (!isLooping) {
          setIsPlaying(false);
        }
      },
    });

    setSound(newSound);
  };

  const pause = () => {
    if (sound) {
      sound.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (sound) {
      sound.play();
      setIsPlaying(true);
    }
  };

const toggleLoop = () => {
  setIsLooping(prev => !prev);
};

// ใช้ useEffect คอยเช็ค isLooping แล้ว set loop ให้ sound ทุกครั้งที่เปลี่ยน
useEffect(() => {
  if (sound) {
    sound.loop(isLooping);
    console.log("useEffect set sound.loop to", isLooping);
  }
}, [isLooping, sound]);

  const seek = (pos: number) => {
    if (sound) {
      sound.seek(pos);
      setPosition(pos);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem("volume", vol.toString());
    if (sound) {
      sound.volume(vol);
    }
  };

  useEffect(() => {
    if (sound) {
      sound.loop(isLooping);
    }
  }, [isLooping, sound]);

  // pause & play by spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // ป้องกันการ scroll หน้า
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, pause, resume]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        position,
        duration,
        playSong,
        pause,
        resume,
        seek,
        setVolume,
        isLooping,
        toggleLoop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
