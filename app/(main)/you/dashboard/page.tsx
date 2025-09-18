"use client";

import React, { useEffect, useState } from "react";
import Mdpic from "@/components/cover_pic/Smpicrecent";
import DashboardCard from "@/components/dashboard/DashCard";
import { Play, Heart } from "lucide-react";
import Link from "next/link";

type TopSong = {
  id: number;
  name_song: string;
  picture?: string;
  stat: {
    play_count: number;
    like_count: number;
  } | null;
};

type DashboardData = {
  totalPlays: number;
  totalLikes: number;
  totalFollowers: number;
  topSongs: TopSong[];
  topSongForCard?: {
    picture: string;
    name_song: string;
  };
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"play_high" | "play_low" | "like_high">(
    "play_high"
  );

  useEffect(() => {
    fetch("/api/service/Dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!data) return <div className="p-10">No data available</div>;

  // --- ฟังก์ชันจัดเรียง ---
  const sortedSongs = [...data.topSongs].sort((a, b) => {
    if (!a.stat || !b.stat) return 0;
    if (filter === "play_high") return b.stat.play_count - a.stat.play_count;
    if (filter === "play_low") return a.stat.play_count - b.stat.play_count;
    if (filter === "like_high") return b.stat.like_count - a.stat.like_count;
    if (filter === "like_low") return a.stat.like_count - b.stat.like_count
    return 0;
  });

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 w-full">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          <DashboardCard
            name="All listeners"
            picture={data.topSongForCard?.picture || "/placeholder.png"}
            totalPlays={data.totalPlays}
          />

          <div className="bg-neutral-900 rounded-xl px-6 py-6 flex justify-between items-center shadow">
            <h3 className="font-bold text-4xl">All Likes</h3>
            <span className="font-bold text-3xl text-pink-400">
              {data.totalLikes}
            </span>
          </div>

          <div className="bg-neutral-900 rounded-xl px-6 py-6 flex justify-between items-center shadow">
            <h3 className="font-bold text-3xl">All Followers</h3>
            <span className="font-bold text-3xl text-green-400">
              {data.totalFollowers}
            </span>
          </div>
        </div>

        {/* Song Lists */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Song lists</h2>
            <select
              className="bg-neutral-800 text-white px-3 py-1 rounded-md text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="play_high">Most listeners</option>
              <option value="play_low">Less listeners</option>
              <option value="like_high">❤️ Most like</option>
              <option value="like_low">❤️ Less like</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
            {sortedSongs.length === 0 ? (
              <p className="text-gray-400 text-center py-10 mt-10">
                No songs uploaded yet.
              </p>
            ) : (
              sortedSongs.map((song) => (
                <Link
                  key={song.id}
                  href={`/viewsongs/${song.id}`}
                  className="block rounded-lg hover:opacity-80 transition"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer hover:bg-neutral-900 p-3 rounded-lg transition"
                  >
                    <Mdpic
                      picture={song.picture || "/placeholder.png"}
                      name={song.name_song}
                    />
                    <span className="flex-1 font-medium truncate">
                      {song.name_song}
                    </span>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-milk font-semibold">
                        <Play className="w-4 h-4" />
                        {song.stat?.play_count?.toLocaleString() ?? 0}
                      </div>
                      <div className="flex items-center gap-1 text-pink-400 font-semibold">
                        <Heart className="w-4 h-4" />
                        {song.stat?.like_count?.toLocaleString() ?? 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:block bg-neutral-900 rounded-xl h-full p-4">
          <h2 className="font-bold text-lg">What Shoud how i do ?</h2>
          <p className="text-sm text-gray-400 mt-2">
            i dont know but i must do something with this space
          </p>
        </div>
      </div>
    </div>
  );
}
