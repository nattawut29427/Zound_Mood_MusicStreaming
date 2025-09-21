"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Diary } from "@/components/types";
import parse from "html-react-parser";
import Picdiary from "../cover_pic/Picdiary";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import { usePlayer } from "@/app/context/Playercontext";

export function DiaryModal({
  open,
  onOpenChange,
  diaries,
  initialIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diaries: Diary[];
  initialIndex: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const diary = diaries[currentIndex];
  const { data: session } = useSession();
  const urlImage = useSignedImage(diary.user?.image || "");

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);

  const { playDiary } = usePlayer();
  const lastPlayedDiaryId = useRef<number | null>(null);

  // ตั้งค่า currentIndex เมื่อ initialIndex เปลี่ยน
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // ดึง Likes/Views ของ Diary ปัจจุบัน
  useEffect(() => {
    if (!diary || !session?.user) return;

    const fetchLikeAndView = async () => {
      try {
        const res = await fetch(`/api/diarylike?diaryId=${diary.id}`);
        const data = await res.json();
        setLiked(data.liked);
        setLikes(data.likes);
        setViews(data.views);
      } catch (err) {
        console.error("Failed to fetch likes/views", err);
      }
    };

    fetchLikeAndView();
  }, [diary?.id, session?.user]);

  // เล่นเพลงเมื่อ Diary เปลี่ยน
  useEffect(() => {
    if (!diary) return;
    if (lastPlayedDiaryId.current === diary.id) return;

    playDiary(diary);
    lastPlayedDiaryId.current = diary.id;
  }, [diary, playDiary]);

  if (!diary) return null;

  // Like diary
  const toggleLike = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const action = liked ? "unlike" : "like";  // ถ้าชอบแล้ว → unlike, ถ้ายังไม่ชอบ → like
      const res = await fetch("/api/playsongDiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryId: diary.id, action }),
      });
      const data = await res.json();

      if (res.ok) {
        if (action === "like" && data.liked) {
          setLiked(true);
          setLikes((prev) => prev + 1);
        } else if (action === "unlike" && data.unliked) {
          setLiked(false);
          setLikes((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error("Failed to toggle like diary", err);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentIndex < diaries.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="relative flex flex-col h-[40rem] md:flex-row sm:h-[48rem] rounded-md overflow-hidden">
          {/* เนื้อหาหลัก */}
          <div className="flex-1 p-6 overflow-auto h-full">
            <DialogTitle></DialogTitle>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <img
                  src={urlImage || "noImage"}
                  alt=""
                  className="rounded-full h-10 w-10"
                />
                <p className="font-bold">{diary.user?.name}</p>
              </div>
              {/* <DialogDescription>
                {new Date(diary.created_at).toLocaleString()}
              </DialogDescription> */}
            </DialogHeader>

            <div className="prose prose-sm max-w-none text-black mb-4">
              {parse(diary.content)}
            </div>

            <div className="border-2 px-4 py-2 rounded-full flex items-center space-x-2 shadow-md">
              {diary.song_removed ? (
                <p className="text-red-500 font-bold text-sm">
                  เพลงนี้ถูกลบแล้ว
                </p>
              ) : (
                <>
                  <Picdiary picture={diary.song?.picture || ""} name="" />
                  <p className="text-black font-bold text-sm truncate">
                    {diary.song?.name_song}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <div className="text-sm text-gray-500 mt-2">
                ❤️ {likes} likes 👁 {views} views
              </div>
            </div>
          </div>

          {/* ปุ่ม Like */}
          <button
            onClick={toggleLike}
            disabled={loading}
            className={`absolute z-10 right-4 top-3
              shadow-md rounded-full px-4 py-2 text-sm font-semibold
              transition-colors duration-300 cursor-pointer border
              ${liked
                ? "text-red-500 border-red-500 bg-red-50"
                : "text-gray-600 border-gray-300 bg-white hover:bg-gray-100"
              }
              ${loading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {liked ? "❤️ Like" : "🤍 Like"}
          </button>

          {/* ปุ่ม Prev */}
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 
                         bg-white/70 hover:bg-white shadow-md rounded-full 
                         p-2 transition cursor-pointer"
            >
              ◀
            </button>
          )}

          {/* ปุ่ม Next */}
          {currentIndex < diaries.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 
                         bg-white/70 hover:bg-white shadow-md rounded-full 
                         p-2 transition cursor-pointer"
            >
              ▶
            </button>
          )}

          {/* ปุ่ม Delete */}
          {session?.user?.id === diary.user_id && (
            <button
              onClick={async () => {
                if (!confirm("คุณต้องการลบ Diary นี้ใช่หรือไม่?")) return;

                try {
                  const res = await fetch(`/api/service/Diary/${diary.id}`, {
                    method: "DELETE",
                  });

                  if (res.ok) {
                    alert("ลบ Diary สำเร็จ");
                    onOpenChange(false); // ปิด modal หลังลบ
                  } else {
                    alert("ไม่สามารถลบ Diary ได้");
                  }
                } catch (err) {
                  console.error("Failed to delete diary", err);
                }
              }}
              className="absolute z-10 right-9 bottom-4
               shadow-md rounded-full px-4 py-2 text-sm font-semibold
               text-white bg-red-500   hover:bg-red-600
               transition-colors duration-300 cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
