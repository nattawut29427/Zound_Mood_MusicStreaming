// app/diary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import { Diary } from "@/components/types";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Picdiary from "@/components/cover_pic/Picdiary";
import parse from "html-react-parser";
import { useRef } from "react";
import { usePlayer } from "@/app/context/Playercontext";
import { DiaryModal } from "@/components/Diarymodal/Modal";
import { useSession } from "next-auth/react";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

function DiaryCard({
  diary,
  onClick,
  onExpand,
}: {
  diary: Diary;
  onClick: () => void;
  onExpand: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const MAX_HEIGHT = 512;
  const { data: session, status } = useSession();

  const urlImage = useSignedImage(session?.user.image || "")



  useEffect(() => {
    const el = contentRef.current;
    if (el && el.scrollHeight > MAX_HEIGHT) {
      setIsOverflowing(true);
    }
  }, []);

  

  return (
    <div
      className="border rounded-lg p-3 mb-4 shadow-sm bg-white w-[280px] h-[30rem] text-sm flex flex-col hover:bg-gray-100"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-black">
        <div className="flex items-center space-x-2">
          <img
            className="rounded-full w-8 h-8 object-cover"
            src={urlImage || "noimage"}
            alt={diary.user?.name || "User"}
          />
          <span className="text-sm font-medium">{diary.user?.name}</span>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {format(new Date(diary.created_at), "yy-MM-dd HH:mm")}
        </span>
      </div>

      {/* Content Preview */}
      <div
        ref={contentRef}
        className={`prose prose-sm max-w-none text-black break-words overflow-hidden relative transition-all duration-300 ${
          expanded ? "h-auto" : "h-[500px]"
        }`}
      >
        {parse(diary.content)}

        {isOverflowing && !expanded && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            <button
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-black text-xs px-4 py-1 border rounded-full bg-white hover:bg-gray-200 transition cursor-pointer mb-4"
              onClick={(e) => {
                e.stopPropagation(); // ไม่ให้ onClick ข้างนอกทำงาน (เช่นเปิด modal)
                onExpand();
              }}
            >
              ดูเพิ่มเติม
            </button>
          </>
        )}
      </div>

      {/* Footer (ไม่มี ref ซ้ำ) */}
      <div className="border-2 mt-auto px-4 p-4 py-2 rounded-full flex items-center space-x-1 shadow-md ">
        <Picdiary picture={diary.song?.picture || ""} name="" />
        <p className="text-black font-bold text-sm truncate">
          {diary.song?.name_song}
        </p>
      </div>
    </div>
  );
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const { view, setView } = useSidebar();
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { playDiary, stop,  } = usePlayer();

  function handleCreatedPlaylist() {
    setView(view === "createDiary" ? "default" : "createDiary");
  }

  async function incrementDiaryView(diaryId: number) {
    try {
      await fetch("/api/playsongDiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryId, action: "view" }),
      });
    } catch (error) {
      console.error("Failed to increment diary view", error);
    }
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

  console.log("selectedDiary", selectedDiary);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-screen  mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold mb-4">All Diaries</h1>
      <ScrollArea>

        <div className="flex flex-row h-fit gap-4 cursor-pointer">
          {diaries.map((diary) => (
            <DiaryCard
              key={diary.id}
              diary={diary}
              onClick={() => {
                incrementDiaryView(diary.id); // เรียก API เพิ่มยอดวิว
                playDiary(diary); // เล่นเพลงใน diary
                setSelectedDiary(diary);
                setIsOpen(true);
              }}
              onExpand={() => {
                incrementDiaryView(diary.id);
                playDiary(diary);
                setSelectedDiary(diary);
                setIsOpen(true);
              }}
            />
          ))}
        </div>
      </ScrollArea>

      <button
        onClick={handleCreatedPlaylist}
        className="px-4 py-2 bg-blue-500 text-white rounded-full"
      >
        Create Playlist
      </button>

      {/*  Modal Popup เมื่อเลือก Diary */}
      {selectedDiary && (
        <DiaryModal
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              stop();
              setSelectedDiary(null);
            }
          }}
          diary={selectedDiary}
        />
      )}
    </div>
  );
}
