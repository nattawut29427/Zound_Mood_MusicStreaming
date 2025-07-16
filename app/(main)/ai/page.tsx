"use client";

import { useRouter } from "next/navigation";
import { useGeneratedPlaylist } from "@/app/context/GeneratedPlaylistContext";
import React, { useState, useEffect } from "react";
import { Song } from "@/components/types";

const AIGenPage = () => {
  const router = useRouter();
  const { setData } = useGeneratedPlaylist();

  const [prompt, setPrompt] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSongs() {
      const res = await fetch("/api/song");
      const data = await res.json();
      setSongs(data.songs);
    }
    fetchSongs();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, songs }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setData({
        songIds: data.playlist || [],
        playlistName: "My AI Playlist",
        pictureUrl:
          "https://i.pinimg.com/736x/8a/da/ff/8adafffbab914e5f2f3b487b9037dbdc.jpg",
        reason: data.reason || "",
      });

      router.push("/ai/result");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-screen mx-10 mt-10 my-8 p-6 font-sans bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-start text-gray-800">
        สร้าง Playlist ด้วย AI
      </h1>

      <textarea
        placeholder="อยากฟังเพลงแบบไหน เช่น เพลงเหงา ๆ วันที่ฝนตก"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <div className="flex items-end justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-3 px-4 py-2 text-base  bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "กำลังสร้าง..." : "สร้าง Playlist"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>
    </main>
  );
};

export default AIGenPage;
