"use client";
import { useState, useEffect } from "react";
import { Howl } from "howler";

export default function Duration({ url }: { url: string }) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!url) return;

    const sound = new Howl({ src: [url] });

    sound.once("load", () => {
      setDuration(sound.duration());
      sound.unload(); // clear memory เมื่อไม่ใช้
    });

    return () => {
      sound.unload();
    };
  }, [url]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return <div>{formatTime(duration)}</div>;
}
