"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Mdpic from "@/components/cover_pic/Mdpic";
import { usePlayer } from "@/app/context/Playercontext";
import { Song, ShortSong } from "@/components/types";
import Link from "next/link";
import DropPF from "@/components/button/Profile/DropPF";
import LoadingSpinner from "../loading/Loading";
import DeleteSongButton from "../button/Delsg";
import DeleteShortSongButton from "../button/short/DelShort";

type TabName = "Popular" | "Track" | "Playlist" | "Like" | "Short";

type PlaylistSong = { song: Song };

type Playlist = {
  id: number;
  user_id: string;
  created_at: string;
  name_playlist: string;
  pic_playlists: string;
  playlist_songs: PlaylistSong[];
  user?: {
    id: string;
    name: string;
  };
};

type LikeSong = {
  id: number;
  user_id: string;
  song_id: number;
  created_at: string;
  song: Song;
};

type UserData = {
  profileKey?: string;
  username?: string;
  songs?: Song[];
  playlists?: Playlist[];
  likesongs?: LikeSong[];
  shortSongs?: ShortSong[];
  listeningHistories?: any[];
};

interface NavigatorProps {
  userId: string;
}

export default function Navigator({ userId }: NavigatorProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabName>("Popular");
  const [userData, setUserData] = useState<UserData | null>(null);
  const { playSong, stop, isPlaying, playQueue } = usePlayer();
  const isOwner = session?.user?.id === userId;

  // สร้าง tabs เฉพาะที่ควรโชว์
  const availableTabs: TabName[] = ["Popular", "Track"];
  if (isOwner) {
    availableTabs.push("Playlist", "Like", "Short");
  }

  useEffect(() => {
    if (!userId) return;

    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return (
      <div className="justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs: Record<TabName, any[]> = {
    Popular: (userData.songs || [])
      .slice()
      .sort(
        (a, b) =>
          (b.SongStat?.play_count || 0) - (a.SongStat?.play_count || 0)
      ),
    Track: userData.songs || [],
    Playlist: userData.playlists || [],
    Like: userData.likesongs || [],
    Short: userData.shortSongs || [],
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 text-xl px-8 mb-10 mt-24 font-semibold">
        {availableTabs.map((tab) => (
          <span
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer ${activeTab === tab
              ? "border-b-2 border-purple-600 text-white"
              : "text-gray-500 hover:text-purple-500"
              }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* List */}
      <div className="px-6 mt-4 space-y-2">
        {tabs[activeTab].length === 0 && (
          <div className="text-gray-500">No data available.</div>
        )}

        {/* Popular / Track */}
        {(activeTab === "Popular" || activeTab === "Track") &&
          tabs[activeTab].map((song: Song) => (
            <Link
              key={song.id}
              href={`/viewsongs/${song.id}`}
              className="block rounded-lg hover:opacity-80 transition"
            >
              <div
                key={song.id}
                className="flex items-center cursor-pointer hover:bg-neutral-950 text-gray-600 hover:text-white p-2 rounded-xl duration-300"
              >
                <Mdpic
                  picture={song.picture || "/fallback.jpg"}
                  name={song.name_song}
                  isPlaying={isPlaying}
                  onPlayClick={() => {
                    if (song.audio_url) {
                      playSong(song);
                    }
                  }}
                  onPauseClick={() => stop()}
                />
                <div className="flex flex-col ml-4">
                  <span className=" font-bold ml-2">{song.name_song}</span>
                  <span className="font-medium ml-2">
                    {song.uploader?.name || "Unknown Artist"}
                  </span>
                </div>
                <div className=" ml-auto">
                  <DropPF songId={song.id} picture={song.picture || ""} />
                </div>
              </div>
            </Link>
          ))}

        {/* Playlist */}
        {activeTab === "Playlist" &&
          tabs.Playlist.map((playlist: Playlist) => (
            <Link
              key={playlist.id}
              href={`/you/playlists/${playlist.id}`}
              className="block rounded-lg hover:opacity-80 transition"
            >
              <div
                key={playlist.id}
                className="flex items-center cursor-pointer hover:bg-neutral-950 text-gray-600 hover:text-white p-2 rounded-xl duration-300"
              >
                <Mdpic
                  picture={playlist.pic_playlists}
                  name={playlist.name_playlist}
                  onPlayClick={() => {
                    const songs = playlist.playlist_songs.map((ps) => ps.song);
                    if (songs.length > 0) {
                      playQueue(songs, 0);
                    }
                  }}
                  onPauseClick={() => stop()}
                />
                <div className="flex flex-col ml-4">
                  <span className="font-bold ml-2">
                    {playlist.name_playlist}
                  </span>
                  <span className="font-medium ml-2">{playlist.user?.name}</span>
                </div>
                <div className="text-gray-400 ml-auto">≡</div>
              </div>
            </Link>
          ))}

        {/* Like */}
        {activeTab === "Like" &&
          tabs.Like.map((like: LikeSong) => (
            <Link
              key={like.id}
              href={`/viewsongs/${like.song_id}`}
              className="block rounded-lg hover:opacity-80 transition"
            >
              <div
                key={like.id}
                className="flex items-center cursor-pointer hover:bg-neutral-950 text-gray-600 hover:text-white p-2 rounded-xl duration-300"
              >
                <Mdpic
                  picture={like.song.picture || "/fallback.jpg"}
                  name={like.song.name_song}
                  onPlayClick={() => {
                    if (like.song.audio_url) {
                      playSong(like.song);
                    }
                  }}
                  onPauseClick={() => stop()}
                />
                <div className="flex flex-col ml-4">
                  <span className="font-medium ml-2">
                    {like.song.name_song}
                  </span>
                  <span className="font-bold ml-2">
                    {like.song.uploader?.name || "Unknown Artist"}
                  </span>
                </div>
                <div className="text-gray-400 ml-auto">≡</div>
              </div>
            </Link>
          ))}

        {/* Short */}
        {activeTab === "Short" &&
          tabs.Short.map((short: ShortSong) => (

            <div
              key={short.id}
              className="flex items-center cursor-pointer hover:bg-neutral-950 text-gray-600 hover:text-white p-2 rounded-xl duration-300"
            >
              <Mdpic
                picture={short.song?.picture || "/fallback.jpg"}
                name={short.song?.name_song || "Untitled"}
              />
              <div className="flex flex-col ml-4">
                <span className="font-bold ml-2">
                  {short.song?.name_song || "Unknown Artist"}
                </span>
                <span className="font-medium ml-2">
                  {session?.user.username || "No name"}
                </span>
              </div>
              <div className=" ml-auto"><DeleteShortSongButton shortSongId={short.id} songName={short.song?.name_song || "Unknown Artist"} /></div>
            </div>

          ))}
      </div>
    </div>
  );
}
