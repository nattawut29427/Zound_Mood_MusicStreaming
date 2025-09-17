// app/select-music/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlayer } from "@/app/context/Playercontext";
import { Song } from "@/components/types";
import styles from "./SelectMusic.module.css";

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const getR2KeyFromUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const p = new URL(url).pathname.substring(1);
    return `storagemusic/${p}`;
  }
  return `storagemusic/${url}`;
};

export default function SelectMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [clipStart, setClipStart] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { playSong, pause, seek, duration, position, isPlaying, currentTrack, resume } = usePlayer(); // เพิ่ม resume

  // Fetch songs from our API endpoint
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/api/song"); // ตรวจสอบว่า API Route นี้ถูกต้อง
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }
        const data = await response.json();
        setSongs(data.songs);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchSongs();
  }, []);

  // Handle selecting a song from the list
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    playSong(song); // Play the song using context
    setClipStart(0); // Reset clip start time
    setSubmitMessage(null);
  };

  // Handle slider change to select the start time of the clip
  // ใช้ useCallback เพื่อป้องกันการ re-render โดยไม่จำเป็น
  const handleClipChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseInt(e.target.value, 10);
    setClipStart(newStart);
    // Seek to the new start time and ensure it's playing
    seek(newStart);
    if (!isPlaying) { // ถ้าไม่ได้เล่นอยู่ ให้ resume เพื่อให้ผู้ใช้ได้ยินพรีวิว
      resume();
    }
  }, [isPlaying, seek, resume]); // Dependencies for useCallback


  // Handle the final submission to the API
  const handleConfirmSelection = async () => {
    if (!selectedSong) {
      setSubmitMessage("กรุณาเลือกเพลงก่อน");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    pause(); // Pause player before submitting

    // **** แก้ไขตรงนี้: แปลง audio_url ให้เป็น r2Key ที่ถูกต้อง ****
    const r2KeyToSend = getR2KeyFromUrl(selectedSong.audio_url);

    // Data to be sent to the API
    const payload = {
      r2Key: r2KeyToSend, // ใช้ r2Key ที่ถูกต้อง
      start: clipStart,
      duration: 30, // Fixed duration as per requirement
    };

    try {
      const response = await fetch("/api/process-r2-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API request failed");
      }

      const result = await response.json();
      setSubmitMessage(`สำเร็จ! URL เพลงที่ตัดแล้ว: ${result.trimmedAudioUrl}`);
      // คุณอาจจะเพิ่ม Logic เพื่อเล่นเพลงที่ตัดแล้ว หรือดาวน์โหลด
    } catch (err: any) {
      setSubmitMessage(`เกิดข้อผิดพลาด: ${err.message}`);
      setError(`ข้อผิดพลาด: ${err.message}`); // แสดง error ใน state error ด้วย
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate max value for the range slider
  const sliderMax = duration > 30 ? Math.floor(duration - 30) : 0; // ใช้ Math.floor เพื่อให้เป็นจำนวนเต็ม

  return (
    <div className={styles.container}>
      <h1>เลือกเพลงสำหรับสตอรี่ของคุณ</h1>
      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.songList}>
        {songs.length === 0 && !error ? (
          <p>กำลังโหลดเพลง...</p>
        ) : songs.map((song) => (
          <div
            key={song.id} // ใช้ song.id เป็น key
            className={`${styles.songItem} ${
              selectedSong?.id === song.id ? styles.selected : ""
            }`}
            onClick={() => handleSelectSong(song)}
          >
            <img src={song.picture || ""} alt={song.name_song} className={styles.songImage} />
            <div>
              <p className={styles.songName}>{song.name_song}</p>
              {/* ตรวจสอบว่ามี artist_name หรือไม่ ถ้ามีก็แสดง */}
              {song.artist_name && <p className={styles.songArtist}>{song.artist_name}</p>}
            </div>
          </div>
        ))}
      </div>

      {selectedSong && currentTrack?.id === selectedSong.id && (
        <div className={styles.trimmerSection}>
          <h2>เลือกช่วงเวลา (30 วินาที)</h2>
          <div className={styles.player}>
             <div className={styles.timeDisplay}>
                <span>{formatTime(position)}</span> / <span>{formatTime(duration)}</span>
             </div>
             <input
                type="range"
                min="0"
                max={sliderMax}
                value={clipStart}
                onChange={handleClipChange}
                className={styles.slider}
                disabled={duration <= 30}
              />
              {duration <= 30 && <p className={styles.warning}>เพลงนี้สั้นกว่า 30 วินาที ไม่สามารถเลือกช่วงได้</p>}
          </div>

          <button
            onClick={handleConfirmSelection}
            disabled={isSubmitting || duration <= 30 || !selectedSong} // เพิ่ม disabled ถ้าไม่มีเพลงเลือก
            className={styles.confirmButton}
          >
            {isSubmitting ? "กำลังประมวลผล..." : "ยืนยัน"}
          </button>

          {submitMessage && <p className={styles.submitMessage}>{submitMessage}</p>}
        </div>
      )}
    </div>
  );
}