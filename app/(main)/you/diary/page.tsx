"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import parse from "html-react-parser";
import { useSidebar } from "@/app/context/SidebarContext"; // ✅ import context
import { View } from "lucide-react";

interface Diary {
  id: number;
  name_diary: string;
  content: string;
  trimmed_audio_url: string;
  is_private: boolean;
  created_at: string;
  song: {
    id: number;
    title: string;
    artist: string;
  };
  user: {
    id: string;
    name: string | null;
  };
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  const { view, setView } = useSidebar(); // ✅ ดึง setView จาก SidebarContext

  function handleCreatedPlaylist() {
    setView("createDiary");

    if (view === "createDiary") {
      setView("default");
    }
  }

  useEffect(() => {
    async function fetchDiaries() {
      try {
        const res = await fetch("/api/dairy");
        if (!res.ok) throw new Error("Failed to fetch diaries");
        const data = await res.json();
        setDiaries(data.diaries || []);
      } catch (error) {
        console.error("Error fetching diaries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDiaries();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (diaries.length === 0) {
    return <p className="p-4">No diaries found.</p>;
  }

  return (
    <div className="max-w-3xl mb-20 mx-auto px-4 py-8 space-y-6">
      <button
        onClick={handleCreatedPlaylist}
        className="px-4 py-2 bg-blue-500 text-white rounded-full"
      >
        Create Playlist
      </button>

      <h1 className="text-2xl font-bold mb-4">📖 All Diaries</h1>
      <div className="flex flex-row gap-3">

      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="border rounded-xl p-4 shadow-sm bg-white space-y-3"
        >
          <div className="flex items-center justify-between text-black">
            <h2 className="text-xl font-semibold">{diary.name_diary}</h2>
            <span className="text-sm text-gray-500">
              {format(new Date(diary.created_at), "yyyy-MM-dd HH:mm")}
            </span>
          </div>
            <div className="prose  max-w-none text-black">
              {parse(diary.content)}
            </div>

          {diary.trimmed_audio_url && (
            <audio
            controls
            src={diary.trimmed_audio_url}
            className="w-full mt-2"
            />
          )}

          {/* <div className="text-sm text-gray-700 mt-2">
             Song: <strong>{diary.song?.title}</strong> by{" "}
             {diary.song?.artist}
             </div>
             
             <div className="text-sm text-gray-600">
             By: {diary.user?.name || "Unknown user"}
             </div> */}
        </div>
      ))}
      </div>
    </div>
  );
}
