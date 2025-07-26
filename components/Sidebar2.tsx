"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import SongCover from "./Songcover";
import { Allplaylist } from "@/components/Allplaylist";
import { uploadImageToR2 } from "@/lib/uploadImage";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";



export default function Sidebar2() {
  const { view, selectedSong, setView } = useSidebar();
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState<string | null>(
    null
  );

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // preview ที่จะแสดง
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  //  เมื่อ selectedSong เปลี่ยน ให้ใช้รูปของเพลงเป็น default
  useEffect(() => {
    if (selectedSong?.picture) {
      setPreviewUrl(selectedSong.picture);
    }
  }, [selectedSong]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleImageUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    console.log("Preview URL:", preview);
    setPreviewUrl(preview);
    setSelectedImageFile(file);
  };

  const handleCreate = async () => {
    setError("");
    let finalPictureKey = previewUrl;

    if (!playlistName) {
      setError("กรุณาตั้งชื่อ Playlist");
      return;
    }

    if (selectedImageFile) {
      try {
        finalPictureKey = await uploadImageToR2(selectedImageFile);
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_playlist: playlistName,
          picture: finalPictureKey,
          song: selectedSong ? [selectedSong.id] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      alert("สร้าง Playlist เรียบร้อย");
      setPlaylistName("");
      setSelectedImageFile(null);
      setView(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!existingPlaylistId) {
      alert("Please select a playlist to add the song");
      return;
    }

    try {
      const res = await fetch(`/api/playlist`, {
        method: "PUT",
        body: JSON.stringify({
          playlistId: parseInt(existingPlaylistId),
          songId: selectedSong?.id,
        }),
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
      <div className="w-80 p-4 space-y-4 bg-gradient-to-t from-black to-[#252525] duration-200 h-full flex flex-col">
        <h2 className="text-xl font-bold pb-2">Add to Playlist</h2>

        {/* Search Playlist */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="ค้นหา Playlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg px-4 bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <Allplaylist
            onSelectPlaylist={(id) => setExistingPlaylistId(id)}
            selectedPlaylistId={existingPlaylistId}
            search={search}
          />
        </div>

        {/* Button Zone */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleAddToPlaylist}
            disabled={!existingPlaylistId}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold disabled:opacity-40"
          >
            ✅ Add to Playlist
          </button>

          <button
            onClick={() => setView("createNewPlaylist")}
            className="w-full py-2 rounded-full bg-neutral-800 text-white border border-white"
          >
             Create New Playlist
          </button>

          <button
            onClick={() => setView(null)}
            className="w-full py-2 rounded-lg bg-zinc-700 text-white"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === "createNewPlaylist") {
    return (
      <div className="w-80 p-4 space-y-4 bg-gradient-to-t from-black to-[#252525] duration-200 h-full flex flex-col">
        <h2 className="text-xl font-bold pb-2">Create Playlist</h2>

        <div className="flex flex-col items-center justify-center my-2 space-y-2">
          <div className="space-y-4 w-48 h-fit rounded-lg">
            <SongCover
              picture={previewUrl}
              name="preview"
              onImageChange={handleImageUpload}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <input
          className="w-full p-2 rounded bg-neutral-700"
          placeholder="Playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleCreate}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold"
          >
            ✅ Create Playlist
          </button>

          <button
            onClick={() => setView("createPlaylist")}
            className="w-full py-2 rounded-lg bg-zinc-700 text-white"
          >
            🔙 Back to Playlist
          </button>
        </div>
      </div>
    );
  }

  if (view === "createDiary") {
    return (
      <div className="duration-300">
        <SimpleEditor />
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
