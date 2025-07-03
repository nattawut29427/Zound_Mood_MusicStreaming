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
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";

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

  // ใช้ useCachedSignedUrl เพื่อแคช signed url
  const signedUrl = useCachedSignedUrl(currentTrack?.audio_url);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) {
        setPosition(sound.seek() as number);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  // เล่นเพลงเมื่อ signedUrl เปลี่ยน (ได้ URL ที่แคชแล้ว)
  useEffect(() => {
    if (!signedUrl || !currentTrack) return;

    if (sound) {
      sound.stop();
      sound.unload();
    }

    const newSound = new Howl({
      src: [signedUrl],
      html5: true,
      volume,

      onplay: () => {
        setIsPlaying(true);
        setDuration(newSound.duration()); 
      },
      onend: () => {
        setIsPlaying(false);
        if (!isLooping) {
          setIsPlaying(false);
        }
      },
    });

    newSound.play();
    setSound(newSound);

    return () => {
      newSound.unload();
    };
  }, [signedUrl, currentTrack?.id]);

  const playSong = (song: Song) => {
    setCurrentTrack(song);
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
    setIsLooping((prev) => !prev);
  };

  // ตั้งค่า loop ให้ sound ทุกครั้งที่ isLooping หรือ sound เปลี่ยน
  useEffect(() => {
    if (sound) {
      sound.loop(isLooping);
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

  // ควบคุม pause/play ด้วย spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        position,
        duration,
        isLooping,
        playSong,
        pause,
        resume,
        seek,
        setVolume,
        toggleLoop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
