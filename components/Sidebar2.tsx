"use client";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import SongCover from "./Songcover";

export default function Sidebar() {
  const { view, selectedSong, setView } = useSidebar();
  const picture = selectedSong?.picture ?? "default.jpg";
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "add">("create"); // Mode toggle

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      alert("Please enter a playlist name");
      return;
    }

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        body: JSON.stringify({
          name_playlist: playlistName,
          picture,
          song: selectedSong ? [selectedSong.id] : [],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      alert("Playlist created successfully!");
      setPlaylistName("");
      setView(null); // กลับหน้าหลัก
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!existingPlaylistId) {
      alert("Please select a playlist to add the song");
      return;
    }

    try {
      const res = await fetch(`/api/playlist/${existingPlaylistId}/add`, {
        method: "POST",
        body: JSON.stringify({ songId: selectedSong?.id }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      alert("Song added to playlist!");
      setView(null);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  if (view === "createPlaylist") {
    return (
      <div className="w-78 p-4 space-y-4 bg-gradient-to-t duration-200 from-black from-[10%] to-[#252525]">
        <h2 className="text-xl font-bold">Manage Playlist</h2>

        {/* Toggle between Create or Add */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${mode === "create" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setMode("create")}
          >
            Create New
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === "add" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setMode("add")}
          >
            Add to Existing
          </button>
        </div>

        {mode === "create" ? (
          // Create New Playlist
          <>
            <div className="items-center justify-center flex my-10">
              <SongCover picture={picture} name="Playlist Cover" />
            </div>
            <input
              className="w-full p-2 rounded bg-neutral-700"
              placeholder="Playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
            <button onClick={handleCreate} className="bg-white text-black px-3 py-1 rounded">
              Create Playlist
            </button>
          </>
        ) : (
          // Add to Existing Playlist
          <>
            <select
              className="w-full p-2 rounded bg-neutral-700"
              onChange={(e) => setExistingPlaylistId(e.target.value)}
            >
              <option value="">Select Playlist</option>
              <option value="1">My Favorites</option>
              <option value="2">Workout Mix</option>
              <option value="3">Chill Vibes</option>
            </select>
            <button onClick={handleAddToPlaylist} className="bg-white text-black px-3 py-1 rounded mt-4">
              Add to Playlist
            </button>
          </>
        )}

        <button
          onClick={() => setView(null)}
          className="bg-neutral-600 text-white px-3 py-1 rounded mt-4"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <aside className="w-78 p-4 bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between">
      <div>
        <h1 className="text-white font-bold text-3xl">TOPIC</h1>
      </div>
    </aside>
  );
}
