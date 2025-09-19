"use client";

import React, { useEffect, useState } from "react";
import Smpic_recent from "@/components/cover_pic/Smpicrecent";
import { Song } from "../types";
import { usePlayer } from "@/app/context/Playercontext";

type HistoryItem = {
  id: number;
  song: Song;
  listened_at: string;
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // วินาที

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`; // น้อยกว่า 30 วัน
  return past.toLocaleDateString("th-TH"); // ถ้าเกิน 30 วัน แสดงวันที่แทน
}

export default function ListeningHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history_song");
        if (!res.ok) throw new Error("Failed to fetch listening history");

        const data = await res.json();
        setHistory(data.history);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading)
    return <div className="text-gray-400">Loading listening history...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (history.length === 0)
    return <div className="text-gray-400">No listening history found.</div>;

  return (
    <div className="">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => playSong(item.song)}
          className="flex items-center gap-4 rounded-xl shadow p-4 transition hover:bg-zinc-950 cursor-pointer"
        >
          <div className="rounded">
            <Smpic_recent
              picture={item.song.picture || "/fallback.jpg"}
              name={item.song.name_song}
              onPlayClick={() => {
                if (item.song.audio_url) {
                  playSong(item.song);
                }
              }}
              onPauseClick={() => stop()}
            />
          </div>

          <div className="flex flex-col">
            <div className="overflow-hidden w-full group">
              <span
                className={`block font-bold text-md text-white whitespace-nowrap ${
                  item.song.name_song.length > 30
                    ? "group-hover:animate-marquee"
                    : ""
                }`}
              >
                {item.song.name_song}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Listen {timeAgo(item.listened_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
