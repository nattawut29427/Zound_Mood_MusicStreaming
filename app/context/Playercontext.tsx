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
  queue: Song[];
  queueIndex: number;
  playNext: () => void;
  playPrevious: () => void;
  playSong: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  seek: (pos: number) => void;
  setVolume: (vol: number) => void;
  toggleLoop: () => void;
  setQueue: (songs: Song[]) => void;
  playQueue: (songs: Song[], startIndex: number) => void;
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

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // ใช้ useCachedSignedUrl เพื่อแคช signed url
  const signedUrl = useCachedSignedUrl(currentTrack?.audio_url);

  const playQueue = (songs: Song[], startIndex: number) => {
    if (songs.length === 0) return;

    setQueue(songs);
    setQueueIndex(startIndex);
    setCurrentTrack(songs[startIndex]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) {
        setPosition(sound.seek() as number);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  const playNext = () => {
    console.log(" Queue length:", queue.length);
    console.log(
      "Queue songs:",
      queue.map((s, i) => `${i + 1}. ${s.name_song}`)
    );
    setQueueIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < queue.length) {
        setCurrentTrack(queue[nextIndex]);
        return nextIndex;
      }
      return prevIndex;
    });
  };

  const playPrevious = () => {
    if (queueIndex > 0) {
      setQueueIndex(queueIndex - 1);
      setCurrentTrack(queue[queueIndex - 1]);
    }
  };

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
        if (!isLooping) {
          setIsPlaying(false);
          playNext();
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

  //controll play/puses with spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        (e.target as HTMLElement).isContentEditable;

      if (e.code === "Space" && !isTyping) {
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
        playQueue,
        currentTrack,
        isPlaying,
        volume,
        position,
        duration,
        isLooping,
        playSong,
        queue,
        queueIndex,
        pause,
        resume,
        seek,
        setVolume,
        toggleLoop,
        playNext,
        playPrevious,
        setQueue: (songs) => setQueue(songs),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
