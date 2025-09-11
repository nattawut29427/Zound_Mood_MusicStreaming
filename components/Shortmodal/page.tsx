"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import { usePlayer } from "@/app/context/Playercontext";
import { ShortSong } from "@/components/types";
import Image from "next/image";
import { Play, X } from "lucide-react";
import SongCover from "../cover_pic/Short/Shortpic";

interface ShortSongModalProps {
  open: boolean;
  onClose: () => void;
  shortsongs: ShortSong[];
  initialIndex: number;
}

export default function ShortSongModal({
  open,
  onClose,
  shortsongs,
  initialIndex,
}: ShortSongModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const shortSong = shortsongs[currentIndex];
  const { data: session } = useSession();
  const { playShortSong, stop } = usePlayer();

  const urlImage = useSignedImage(shortSong?.user?.image || "");
  const audioUrl = useCachedSignedUrl(shortSong?.trimmedR2Key);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!shortSong || !audioUrl) return;
    playShortSong(shortSong, audioUrl);
  }, [shortSong.id, audioUrl]);

  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);

  if (!open || !shortSong) return null;

  const goNext = () => {
    if (currentIndex < shortsongs.length - 1) setCurrentIndex((prev) => prev + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-0">
      {/* Close button */}
      <button
        onClick={() => {
          stop();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 text-white p-2 rounded-full hover:bg-white/20"
      >
        <X className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Modal content */}
      <div className="relative w-full max-w-md md:max-w-2xl h-[80vh] md:h-[90vh] flex flex-col justify-between overflow-hidden rounded-xl">
        {/* Background */}
        <SongCover
          picture={shortSong.song?.picture || "/fallback.jpg"}
          name={shortSong.song?.name_song || "Unknown"}
         
        />

        {/* Tap to preview overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg md:text-2xl font-bold z-10">
          Tap to preview
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-8 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 md:p-5 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-3">
            <Image
              src={urlImage || "/fallback-avatar.png"}
              alt={shortSong.user?.name || "User"}
              width={40}
              height={40}
              className="rounded-full w-10 h-10 md:w-12 md:h-12"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">
                {shortSong.song?.name_song || "Unknown"}
              </p>
              <p className="text-xs md:text-sm text-gray-300">
                {shortSong.user?.name || "Unknown"}
              </p>
            </div>
            <button className="ml-auto bg-white text-black px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm">
              Follow
            </button>
          </div>

          {/* <div className="flex items-center gap-2 mt-2">
            <button
              className="bg-white/20 p-2 md:p-3 rounded-full"
              onClick={() => playShortSong(shortSong, audioUrl || "")}
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <p className="text-xs md:text-sm text-gray-300">Play preview</p>
          </div> */}
        </div>

        {/* Navigation */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/60 cursor-pointer duration-300 shadow-md rounded-full p-2 md:p-3"
          >
            ◀
          </button>
        )}
        {currentIndex < shortsongs.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/60 cursor-pointer duration-300 shadow-md rounded-full p-2 md:p-3"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}
