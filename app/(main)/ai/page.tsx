"use client";

import { useRouter } from "next/navigation";
import { useGeneratedPlaylist } from "@/app/context/GeneratedPlaylistContext";
import React, { useState, useEffect } from "react";
import { Song } from "@/components/types";
import { Particles } from "@/components/magicui/particles";
import { MorphingText } from "@/components/magicui/morphing-text";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { AnimatedList } from "@/components/magicui/animated-list";

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
      const res = await fetch("/api/service/generate-playlist", {
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
    <main className="h-full flex z-10 flex-col text-white aurora-bg overflow-hidden animate-gradient bg-gradient-to-t from-violet-600 via-20% via-purple-800 to-black  bg-[length:200%_200%]">

      {/* ส่วนเนื้อหาด้านบน */}
      <div className="flex-1 overflow-y-auto  p-6">
        <h1 className="text-3xl font-extrabold mb-6 text-center"></h1>
        <MorphingText texts={["Make your playlist", "with Ai", "What your feeling"]} />
        <SparklesText className="text-md font-thin text-center" sparklesCount={0}>
          Let AI create a playlist for you
        </SparklesText>

        <Particles className="relative inset-0 z-0" />
      </div>

       

      {/* กล่อง input ที่อยู่ล่างสุด*/}
      <div className=" p-4  mb-20">
        <div className="flex items-center w-full  bg-white border border-gray-300 rounded-full focus-within:ring-2 focus-within:ring-violet-700 focus-within:border-transparent transition-shadow">
          <input
            placeholder="อยากฟังเพลงแบบไหน เช่น เพลงเหงา ๆ วันที่ฝนตก"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 pl-5 bg-transparent border-none text-black rounded-full focus:outline-none focus:ring-0"
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mr-2 px-4 py-2 text-base bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
          >
            {loading ? "กำลังสร้าง..." : "สร้าง"}
          </button>
        </div>
      </div>
      
    </main>


  );
};

export default AIGenPage;
