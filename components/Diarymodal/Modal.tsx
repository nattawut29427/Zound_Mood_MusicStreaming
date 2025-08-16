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
import { format } from "date-fns";
import Picdiary from "../cover_pic/Picdiary";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

export function DiaryModal({
  open,
  onOpenChange,
  diary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diary: Diary;
}) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const fetchLikeAndView = async () => {
      const res = await fetch(`/api/diarylike?diaryId=${diary.id}`);
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
      setViews(data.views);
    };

    fetchLikeAndView();
  }, [diary.id, session?.user]);

  // useEffect(() => {
  //   async function fetchLikedStatus() {
  //     if (!session?.user) return;

  //     try {
  //       const res = await fetch(`/api/diarylike?diaryId=${diary.id}`);
  //       const data = await res.json();
  //       if (data.liked) {
  //         setLiked(true);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching like status", err);
  //     }
  //   }

  //   fetchLikedStatus();
  // }, [diary.id, session?.user]);

  const toggleLike = async () => {
    if (!session?.user || liked) return;
    setLoading(true);
    try {
      const res = await fetch("/api/playsongDiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryId: diary.id, action: "like" }),
      });

      const data = await res.json();
      if (res.ok && data.liked) {
        setLiked(true);
      }
    } catch (err) {
      console.error("Failed to like diary", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col h-[46rem] md:flex-row sm:h[30rem] max-w-xl rounded-md overflow-hidden relative">
          {/* เนื้อหาหลัก */}
          <div className="flex-1 p-6 overflow-auto h-full">
            <DialogTitle> </DialogTitle>
            <DialogHeader>
              <div className="flex items-center gap-2 ">
                <img src={diary.user?.image || ""} alt="" className="rounded-full h-10   w-10"/>
                <p className="font-bold">{diary.user?.name}</p>
              </div>
              <DialogDescription>
                {/* {format(new Date(diary.created_at), "yyyy-MM-dd HH:mm")} */}
              </DialogDescription>
            </DialogHeader>

            <div className="prose prose-sm max-w-none text-black mb-4">
              {parse(diary.content)}
            </div>

            <div className="border-2 px-4 py-2 rounded-full flex items-center space-x-2 shadow-md">
              <Picdiary picture={diary.song?.picture || ""} name="" />
              <p className="text-black font-bold text-sm truncate">
                {diary.song?.name_song}
              </p>
            </div>
            <div className="flex justify-end mt-2">
              {diary.user_id === session?.user?.id && (
                <div className="text-sm text-gray-500  mt-2">
                  ❤️ {likes} likes 👁 {views} views
                </div>
              )}
            </div>
          </div>

          {/*  ปุ่ม Like */}
          <button
            onClick={toggleLike}
            disabled={loading}
            className={`absolute z-10 right-4 top-3
    shadow-md rounded-full px-4 py-2 text-sm font-semibold
    transition-colors duration-300 cursor-pointer border
    ${
      liked
        ? "text-red-500 border-red-500 bg-red-50"
        : "text-gray-600 border-gray-300 bg-white hover:bg-gray-100"
    }
    ${loading ? "opacity-50 pointer-events-none" : ""}
  `}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
