"use client";

import React, { useEffect, useState } from "react";
import Mdpic from "@/components/cover_pic/Smpicrecent";
import DashboardCard from "@/components/dashboard/DashCard";

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

          <div className="bg-neutral-900 rounded-full px-6 py-6 flex justify-between items-center">
            <h3 className="font-bold text-4xl">All Like</h3>
            <span className="font-bold text-3xl">{data.totalLikes}</span>
          </div>

          <div className="bg-neutral-900 rounded-full px-6 py-6 flex justify-between items-center">
            <h3 className="font-bold text-3xl">All Follower</h3>
            <span className="font-bold text-3xl">{data.totalFollowers}</span>
          </div>
        </div>

        {/* Song Lists */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-2">Song lists</h2>

          {data.topSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-neutral-900 p-2 rounded-lg"
            >
              <Mdpic
                picture={song.picture || "/placeholder.png"}
                name={song.name_song}
              />
              <span className="flex-1">{song.name_song}</span>
              <span className="font-bold">
                {song.stat?.play_count.toLocaleString()} listeners
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
