"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import { Diary } from "@/components/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import Picdiary from "@/components/cover_pic/Picdiary";
import parse from "html-react-parser";
import { useRef } from "react";
import { usePlayer } from "@/app/context/Playercontext";
import { DiaryModal } from "@/components/Diarymodal/Modal";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import LoadingSpinner from "@/components/loading/Loading";

type Tab = "my" | "following";

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

  const urlImage = useSignedImage(diary.user?.image || "");

  useEffect(() => {
    const el = contentRef.current;
    if (el && el.scrollHeight > MAX_HEIGHT) setIsOverflowing(true);
  }, []);

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
            src={urlImage || "/noimage.png"}
            alt={diary.user?.name || "User"}
          />
          <span className="text-sm font-medium">{diary.user?.name}</span>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {timeAgo(diary.created_at)}
        </span>
      </div>

      {/* Content Preview */}
      <div
        ref={contentRef}
        className={`prose prose-sm max-w-none text-black break-words overflow-hidden relative transition-all duration-300 ${expanded ? "h-auto" : "h-[500px]"
          }`}
      >
        {parse(diary.content)}

        {isOverflowing && !expanded && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            <button
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-black text-xs px-4 py-1 border rounded-full bg-white hover:bg-gray-200 transition cursor-pointer mb-4"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
            >
              ดูเพิ่มเติม
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-2 mt-auto px-4 p-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
        <Picdiary picture={diary.song?.picture || ""} name="" />
        <div className="overflow-hidden w-full group">
          <span
            className={`block font-bold text-md text-black whitespace-nowrap ${Number(diary.song?.name_song.length) > 30 ? "group-hover:animate-marquee" : ""
              }`}
          >
            {diary.song?.name_song || "Unknown"}
          </span>
        </div>

      </div>
    </div>
  );
}

export default function DiaryPage() {
  const [tab, setTab] = useState<Tab>("my");
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const { view, setView } = useSidebar();
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { playDiary, stop } = usePlayer();

  // เพิ่ม view diary
  async function incrementDiaryView(diaryId: number) {
    try {
      await fetch("/api/service/Diary/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryId }),
      });
    } catch (error) {
      console.error("Failed to increment diary view", error);
    }
  }

  // ดึงข้อมูลตาม tab
  async function fetchDiaries(tab: Tab) {
    setLoading(true);
    try {
      const endpoint =
        tab === "my"
          ? "/api/service/Diary/getdiary_user"
          : "/api/service/Diary/getFollow_user";
      const res = await fetch(endpoint);
      const data = await res.json();
      setDiaries(data.diaries || []); // ทั้งสอง API return { diaries: [] }
    } catch (err) {
      console.error("Error fetching diaries:", err);
      setDiaries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiaries(tab);
  }, [tab]);

  if (loading) return <div className="justify-center items-center mt-20"><LoadingSpinner /></div>;

  return (
    <div className="max-w-screen mx-auto px-4 py-8 space-y-6">
      {/* Tab */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-full ${tab === "my" ? "font-bold text-white bg-violet-600 duration-300 cursor-pointer" : "bg-gray-200 text-black font-bold cursor-pointer"
            }`}
          onClick={() => setTab("my")}
        >
          My Diary
        </button>
        <button
          className={`px-4 py-2 rounded-full ${tab === "following" ? "bg-violet-600 text-white font-bold" : "bg-gray-200 text-black font-bold cursor-pointer"
            }`}
          onClick={() => setTab("following")}
        >
          Following / Public
        </button>
      </div>

      
      {diaries.length === 0 ? (
        <div className="flex justify-center items-center h-[450px]">
          <p className="text-gray-500 text-lg font-medium">
            {tab === "my"
              ? "Started your diary "
              : "ยังไม่มีไดอารี่จากผู้ที่คุณติดตาม"}
          </p>
        </div>
      ) : (
        <ScrollArea>
          <div className="flex flex-row h-fit gap-4 cursor-pointer">
            {diaries.map((diary) => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                onClick={() => {
                
                  playDiary(diary);
                  setSelectedDiary(diary);
                  setIsOpen(true);
                }}
                onExpand={() => {
               
                  playDiary(diary);
                  setSelectedDiary(diary);
                  setIsOpen(true);
                }}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Create Diary */}
      <button
        onClick={() => setView(view === "createDiary" ? "default" : "createDiary")}
        className="px-4 py-2 bg-violet-600 text-white rounded-full cursor-pointer hover:bg-violet-700 duration-300"
      >
        Create Diary
      </button>

      {/* Diary Modal */}
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
          diaries={diaries}
          initialIndex={diaries.findIndex((d) => d.id === selectedDiary.id)} // ส่ง index ของที่เลือก
        />
      )}
    </div>
  );
}
