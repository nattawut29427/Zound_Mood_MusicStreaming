// components/TrimmedPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";

const AUDIO_SRC = "/audio/song.mp3"; // เปลี่ยนเป็น URL จริง

export default function TrimmedPlayer() {
  const soundRef = useRef<Howl | null>(null);
  const [startTime, setStartTime] = useState(30); // วินาทีเริ่มต้น
  const [duration, setDuration] = useState(15); // ระยะเวลาเล่น
  const [songDuration, setSongDuration] = useState(0);
  

  const playTrimmed = () => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [AUDIO_SRC],
      html5: true,
      onload: () => {
        const durationFromAudio = sound.duration(); // <<== ดึงจากไฟล์จริง
    setSongDuration(durationFromAudio); // บันทึกใส่ state
    sound.seek(startTime);
    sound.play();
  },
      onplay: () => {
        setTimeout(() => {
          sound.pause(); // หรือ .stop()
        }, duration * 1000 * 60 );
      },
    });

    soundRef.current = sound;
  };

  useEffect(() => {
    return () => {
      soundRef.current?.unload(); // ล้างเสียงเมื่อออกจาก component
    };
  }, []);

  return (
    <div className="p-4 space-y-4 rounded-xl border w-full max-w-md shadow">
      <h2 className="text-xl text-black font-bold">🎵 ตัดเพลงเฉพาะท่อน</h2>

      <div className="space-y-2 text-black">
        <label>เริ่มต้นที่วินาที:</label>
        <input
          type="range"
          min={0}
          max={songDuration - duration} 
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
        />
        <div>{startTime}s</div>

        <label>ระยะเวลา (วินาที):</label>
        <input
          type="range"
          min={1}
          max={30}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <div>{duration}s</div>
      </div>

      <button
        onClick={playTrimmed}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ▶️ เล่นช่วงที่เลือก
      </button>
    </div>
  );
}
