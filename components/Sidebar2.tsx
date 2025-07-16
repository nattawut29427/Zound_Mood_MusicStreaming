"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import SongCover from "./Songcover";
import { Allplaylist } from "@/components/Allplaylist";
import { uploadImageToR2 } from "@/lib/uploadImage";

export default function Sidebar2() {
  const { view, selectedSong, setView } = useSidebar();
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState<string | null>(
    null
  );
  const [mode, setMode] = useState<"create" | "add">("create");

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // preview ที่จะแสดง
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");


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
      <div className="w-78 p-4 space-y-4 bg-gradient-to-t duration-200 from-black from-[10%] to-[#252525]">
        <h2 className="text-xl font-bold pb-5">Create or Add to Playlist</h2>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              mode === "create"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setMode("create")}
          >
            Create New
          </button>
          <button
            className={`px-4 py-2 rounded ${
              mode === "add"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setMode("add")}
          >
            Add to Existing
          </button>
        </div>

        {mode === "create" ? (
          <>
            <div className="flex flex-col items-center justify-center my-6 space-y-2">
              <div className="space-y-4 w-48 h-fit rounded-lg ">
                <SongCover
                  picture={previewUrl}
                  name="preview"
                  
                  onImageChange={handleImageUpload}
                />
              </div>

              {/* <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-400 underline"
              >
                เลือกรูปภาพใหม่
              </button> */}

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

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <button
              onClick={handleCreate}
              className="bg-white text-black px-3 py-1 rounded mt-4"
            >
              Create Playlist
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold mb-2">Select a Playlist</p>
            <Allplaylist
              onSelectPlaylist={setExistingPlaylistId}
              selectedPlaylistId={existingPlaylistId}
            />
            <button
              onClick={handleAddToPlaylist}
              className="bg-white text-black px-3 py-1 rounded mt-4"
              disabled={!existingPlaylistId}
            >
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
