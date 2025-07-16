"use client";

import { useState, useRef } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import SongCover from "@/components/Songcover";
import { Allplaylist } from "@/components/Allplaylist";

export default function Sidebar2() {
  const { view, selectedSong, setView } = useSidebar();
  const defaultPicture = selectedSong?.picture ?? "default.jpg";
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState<string | null>(
    null
  );
  const [mode, setMode] = useState<"create" | "add">("create");

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState(defaultPicture);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (file) {
    handleImageUpload(file);
  }
}

  function handleImageUpload(file: File) {
    setSelectedImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPictureUrl(previewUrl);
    setSaveMessage("📸 เลือกรูปใหม่แล้ว (ยังไม่อัปโหลด)");
  }

  const handleSavePlaylist = async () => {
    setError("");
    setSaveMessage("");

    let finalPictureKey = pictureUrl;

    if (selectedImageFile) {
      try {
        const pictureKey = `cover/${Date.now()}_${selectedImageFile.name}`;

        const signedUrlRes = await fetch(
          `/api/upload?key=${encodeURIComponent(
            pictureKey
          )}&contentType=${encodeURIComponent(selectedImageFile.type)}`
        );

        if (!signedUrlRes.ok) {
          setError("❌ ขอ signed URL สำหรับอัปโหลดรูปไม่สำเร็จ");
          return;
        }

        const { url: uploadUrl } = await signedUrlRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedImageFile.type },
          body: selectedImageFile,
        });

        if (!uploadRes.ok) {
          setError("❌ อัปโหลดรูปไม่สำเร็จ");
          return;
        }

        finalPictureKey = pictureKey;
      } catch (err) {
        setError("❌ เกิดข้อผิดพลาดขณะอัปโหลดรูป");
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

      if (!res.ok) {
        setError("❌ บันทึก Playlist ไม่สำเร็จ: " + data.error);
        return;
      }

      setSaveMessage("✅ Playlist saved successfully!");
      setPlaylistName("");
      setSelectedImageFile(null);
      setView(null);
    } catch {
      setError("❌ บันทึก Playlist ล้มเหลว");
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
            <div className="flex flex-col items-center justify-center my-10 space-y-2">
              <SongCover
                picture={pictureUrl}
                name="Playlist Cover"
               onImageChange={(file) => handleImageUpload(file)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-400 underline"
              >
                เลือกรูปภาพใหม่
              </button>
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
            {saveMessage && (
              <p className="text-green-400 text-sm mt-2">{saveMessage}</p>
            )}

            <button
              onClick={handleSavePlaylist}
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
