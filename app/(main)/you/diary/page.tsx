// app/diary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import { Diary } from "@/components/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import parse from "html-react-parser";

function DiaryCard({ diary }: { diary: Diary }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    async function fetchSignedUrl() {
      if (!diary.trimmed_audio_url) return;

      setLoadingAudio(true);
      try {
        const res = await fetch(
          `/api/playsong?key=${encodeURIComponent(diary.trimmed_audio_url)}`
        );
        const data = await res.json();
        if (data?.url) {
          setSignedUrl(data.url);
        }
      } catch (err) {
        console.error("❌ Failed to load signed URL:", err);
      } finally {
        setLoadingAudio(false);
      }
    }

    fetchSignedUrl();
  }, [diary.trimmed_audio_url]);

  return (
    <div className="border rounded-lg p-3 shadow-sm bg-white space-y-2 w-[280px] max-h-full text-sm">
      <div className="flex items-center justify-between text-black">
        {/* <h2 className="text-base font-semibold truncate">{diary.name_diary}</h2> */}
        <span className="text-xs text-gray-500">
          {format(new Date(diary.created_at), "yy-MM-dd HH:mm")}
        </span>
      </div>

      <div className="prose prose-sm max-w-none text-black break-words">
        {parse(diary.content)}
      </div>

      {loadingAudio && (
        <p className="text-gray-500 text-xs">🎵 กำลังโหลดเสียง...</p>
      )}

      {signedUrl && <audio controls src={signedUrl} className="w-full mt-1" />}
    </div>
  );
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const { view, setView } = useSidebar();

  function handleCreatedPlaylist() {
    setView(view === "createDiary" ? "default" : "createDiary");
  }

  useEffect(() => {
    async function fetchDiaries() {
      try {
        const res = await fetch("/api/dairy");
        const data = await res.json();
        setDiaries(data.diaries || []);
      } catch (err) {
        console.error("Error fetching diaries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDiaries();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-screen mb-20  mx-auto px-4 py-8 space-y-6">
      <ScrollArea>


      <h1 className="text-2xl font-bold mb-4">All Diaries</h1>

      <div className="flex flex-row h-fit gap-4 cursor-pointer">
        {diaries.map((diary) => (
          <DiaryCard key={diary.id} diary={diary} />
        ))}
      </div>
        </ScrollArea>
      <button
        onClick={handleCreatedPlaylist}
        className="px-4 py-2 bg-blue-500 text-white rounded-full"
        >
        Create Playlist
      </button>
    </div>
  );
}
