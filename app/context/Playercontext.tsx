"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Howl } from "howler";
import { Song, Diary, ShortSong } from "@/components/types";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import { useCachedDiary } from "@/lib/hooks/useCacheddiary";
import { usePathname } from "next/navigation";

type PlayerContextType = {
  currentTrack: Song | null;
  isPlaying: boolean;
  volume: number;
  position: number;
  duration: number;
  isLooping: boolean;
  queue: Song[];
  queueIndex: number;
  isAutoContinue: boolean;
  toggleAutoContinue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playSong: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  seek: (pos: number) => void;
  setVolume: (vol: number) => void;
  toggleLoop: () => void;
  setQueue: (songs: Song[]) => void;
  playQueue: (songs: Song[], startIndex: number) => void;
  playDiary: (diary: Diary) => void;
  playShortSong: (shortSong: ShortSong, audioUrl: string) => void;
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
  const [isAutoContinue, setIsAutoContinue] = useState(true);

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [currentDiaryAudioUrl, setCurrentDiaryAudioUrl] = useState<string | null>(null);

  // ShortSong
  const [isShortSongPlaying, setIsShortSongPlaying] = useState(false);

  const pathname = usePathname();

  const signedUrl = useCachedSignedUrl(currentTrack?.audio_url, !!currentTrack);
  const signedUrlDiary = useCachedDiary(currentDiaryAudioUrl ?? undefined);
  const playingUrl = currentDiaryAudioUrl ? signedUrlDiary : signedUrl;

  const logSongPlay = async (songId: number) => {
    try {
      await fetch("/api/playsong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, action: "view" }),
      });
    } catch (err) {
      console.error("Song play log failed:", err);
    }
  };

  // -------------------------------
  // Play ShortSong
  // -------------------------------
  const playShortSong = (shortSong: ShortSong, audioUrl: string) => {
    if (!audioUrl) return;

    const song: Song = {
      id: shortSong.song.id,
      name_song: shortSong.song.name_song,
      audio_url: audioUrl,
      picture: shortSong.song.picture,
      uploaded_by: shortSong.song.artist,
    };

    // หยุดเพลงหลัก
    if (sound) {
      sound.stop();
      sound.unload();
      setSound(null);
    }

    setIsShortSongPlaying(true);

    const shortSound = new Howl({
      src: [audioUrl],
      html5: true,
      volume,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        setIsShortSongPlaying(false);
        shortSound.unload();
        setSound(null);
        setCurrentTrack(null); // ไม่ restore เพลงเก่า
      },
    });

    shortSound.play();
    setCurrentTrack(song);
    setSound(shortSound);
  };

  // -------------------------------
  // Play Diary
  // -------------------------------
  const playDiary = (diary: Diary) => {
    if (!diary.song) return;

    const isFromDiaryPage = pathname.startsWith("/you/diary");
    const audioUrl = isFromDiaryPage ? diary.trimmed_audio_url || diary.song.audio_url : diary.song.audio_url;

    const song: Song = {
      id: diary.song.id,
      name_song: diary.song.name_song,
      audio_url: audioUrl,
      picture: diary.song.picture,
      uploaded_by: diary.song.uploaded_by,
    };

    setCurrentTrack(song);
    setCurrentDiaryAudioUrl(audioUrl);
  };

  // -------------------------------
  // Play main Song
  // -------------------------------
  useEffect(() => {
    if (!playingUrl || !currentTrack || isShortSongPlaying) return;

    if (sound) {
      sound.stop();
      sound.unload();
      setSound(null);
    }

    const newSound = new Howl({
      src: [playingUrl],
      html5: true,
      volume,
      loop: isLooping,
      onplay: () => {
        setIsPlaying(true);
        setDuration(newSound.duration());
        logSongPlay(currentTrack.id);
      },
      onend: async () => {
        setIsPlaying(false);
        if (isLooping) return;

        if (queue.length > 0) playNext();
        else if (isAutoContinue && currentTrack) {
          try {
            const res = await fetch(`/api/recommend?songId=${currentTrack.id}`);
            if (!res.ok) return;
            const nextSong = await res.json();
            if (nextSong?.id && nextSong.id !== currentTrack.id) playSong(nextSong);
          } catch (err) {
            console.error("Auto continue failed:", err);
          }
        }
      },
    });

    newSound.play();
    setSound(newSound);

    return () => {
      newSound.stop();
      newSound.unload();
    };
  }, [playingUrl, currentTrack?.id, isLooping, isShortSongPlaying]);

  // -------------------------------
  // Queue
  // -------------------------------
  const playQueue = (songs: Song[], startIndex: number) => {
    if (!songs.length) return;
    setQueue(songs);
    setQueueIndex(startIndex);
    setCurrentTrack(songs[startIndex]);
  };

  const playNext = () => {
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

  const playSong = (song: Song, songs?: Song[]) => {
    setCurrentDiaryAudioUrl(null);

    if (songs && songs.length > 0) {
      // เล่นเพลงจาก playlist ใช้ queue ของ playlist
      const index = songs.findIndex((s) => s.id === song.id);
      setQueue(songs);
      setQueueIndex(index >= 0 ? index : 0);
      setCurrentTrack(song);
    } else {
      // เล่นเพลงเดี่ยว ๆ queue แค่เพลงเดียว
      setQueue([song]);
      setQueueIndex(0);
      setCurrentTrack(song);
    }
  };;

  const pause = () => {
    if (sound) {
      sound.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (sound) {
      sound.stop();
      setIsPlaying(false);
      setIsShortSongPlaying(false);
      setCurrentTrack(null);
    }
  };

  const resume = () => {
    if (sound) {
      sound.play();
      setIsPlaying(true);
    }
  };

  const toggleLoop = () => setIsLooping((prev) => !prev);
  useEffect(() => { if (sound) sound.loop(isLooping); }, [isLooping, sound]);

  const seek = (pos: number) => { if (sound) { sound.seek(pos); setPosition(pos); } };
  const setVolume = (vol: number) => { setVolumeState(vol); if (sound) sound.volume(vol); };
  const toggleAutoContinue = () => setIsAutoContinue((prev) => !prev);

  // Control spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        (e.target as HTMLElement).isContentEditable;

      if (e.code === "Space" && !isTyping) {
        e.preventDefault();
        if (isPlaying) pause();
        else resume();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  // Update position
  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) setPosition(sound.seek() as number);
    }, 500);
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        position,
        duration,
        isLooping,
        queue,
        queueIndex,
        isAutoContinue,
        toggleAutoContinue,
        playNext,
        playPrevious,
        playSong,
        playDiary,
        playQueue,
        playShortSong,
        stop,
        pause,
        resume,
        seek,
        setVolume,
        toggleLoop,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
