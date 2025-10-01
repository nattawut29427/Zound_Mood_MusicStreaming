"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";
import Image from "next/image";
import { ShortSong } from "@/components/types";
import SongCover from "../PlaylistCover";
import Loading from "../loading/Loading";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

interface ShortSongFeedProps {
    shortsongs: ShortSong[];
    onSongClick: (index: number) => void;
}

export default function ShortSongFeed({ shortsongs, onSongClick }: ShortSongFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // ถ้า shortsongs ว่าง, currentShort จะเป็น undefined
    const currentShort = shortsongs[currentIndex];
    const signedImageUrl = useSignedImage(currentShort?.user?.image || "");

    // ถ้าไม่มี data ให้แสดง loader / ข้อความ
    if (!shortsongs || shortsongs.length === 0 || !currentShort) {
        return (
            <div className="h-64 w-full flex items-center justify-center text-white">
                <Loading />
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black  relative overflow-hidden flex flex-col hover:bg=black-80">
            {/* Tabs */}
            {/* <div className="flex justify-center gap-10 mt-6 text-white font-semibold">
                <button className="border-b-2 border-white pb-1">Discover</button>
                <button className="text-gray-400">Following</button>
            </div> */}

            {/* Preview Zone */}
            <div
                className="flex-1  relative flex items-center py-10 justify-center cursor-pointer"
                onClick={() => onSongClick(currentIndex)}
            >
                {/* Background / Cover */}
                <SongCover
                    picture={currentShort.song?.picture || "error"}
                    name={currentShort.song?.name_song || "Unknown"}


                />

                {/* Tap to Preview */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                    Tap to preview
                </div>

            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                <div className="flex items-center gap-3 text-white">
                    <Image
                        src={signedImageUrl || "/2.jpeg"}
                        alt={currentShort.user?.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div>

                        <div className="overflow-hidden w-full group">
                            <span
                                className={`block font-bold text-md text-white whitespace-nowrap ${currentShort.song?.name_song.length > 30 ? "group-hover:animate-marquee" : ""
                                    }`}
                            >
                                {currentShort.song?.name_song || "Unknown"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300">{currentShort.user?.name || "Unknown"}</p>
                    </div>
                    {/* <button className="ml-auto bg-white text-black px-3 py-1 rounded-full text-sm">
            Follow
          </button> */}
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            className="bg-white/20 p-2 rounded-full"

                        >
                            <Play className="w-5 h-5 text-white" />
                        </button>
                        <p className="text-sm text-gray-300">Play preview</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
