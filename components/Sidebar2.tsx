"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import SongCover from "./Songcover";
import { Allplaylist } from "@/components/Allplaylist";
import { uploadImageToR2 } from "@/lib/uploadImage";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import Card from "@/components/RecentCard/Card";
import Createplaylist from "./cover_pic/Createplaylist";
import ShortSongModal from "@/components/Shortmodal/page";
import { ShortSong } from "@/components/types";
import ShortSongFeed from "./ShortFeed/page";


interface ShortSongFeedProps {
  shortsongs: ShortSong[];
  onSongClick: (index: number) => void;
}

export default function Sidebar2() {
  const { view, selectedSong, setView, selectedPlaylist } = useSidebar();
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylistId, setExistingPlaylistId] = useState<string | null>(
    null
  );

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // preview ที่จะแสดง
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // edit playlist
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>("");
  const [editError, setEditError] = useState("");




  //  short song feed
  const [shortSongs, setShortSongs] = useState<ShortSong[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShortIndex, setCurrentShortIndex] = useState(0);

  // โหลด short songs จาก feed
  useEffect(() => {
    const fetchShortSongsFromFeed = async () => {
      try {
        const res = await fetch("/api/feed/shortfeed");
        if (!res.ok) throw new Error("Failed to load short song feed");
        const data = await res.json();
        setShortSongs(data.shortsongs || []);
      } catch (err) {
        console.error("Error fetching short song feed:", err);
      }
    };
    fetchShortSongsFromFeed();
  }, []);
  useEffect(() => {
    if (view === "editPlaylist" && selectedPlaylist) {
      setEditName(selectedPlaylist.name_playlist);
      setEditPreviewUrl(selectedPlaylist.picture);
      setEditImageFile(null);
      setEditError("");
    }
  }, [view, selectedPlaylist]);

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
            Add to Playlist
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
      <div className="w-80 p-4 bg-gradient-to-t from-black to-[#252525] duration-200 h-full flex flex-col">
        <h2 className="text-xl font-bold pb-2">Create Playlist</h2>

        
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col items-center justify-center my-2 space-y-2">
            <div className="space-y-4 w-48 h-fit rounded-lg">
              <Createplaylist
                picture={previewUrl}
                name="preview"
                onImageChange={handleImageUpload}
              />
            </div>
            <p className="w-full text-left mt-10 font-bold">Title playlist</p>
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
        </div>

      
        <div className="flex flex-col gap-3 mb-20">
          <button
            onClick={handleCreate}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold cursor-pointer"
          >
            Create Playlist
          </button>

          <button
            onClick={() => setView("createPlaylist")}
            className="w-full py-2 rounded-lg bg-zinc-700 text-white cursor-pointer"
          >
            Back to Playlist
          </button>
        </div>
      </div>
    );
  }

  if (view === "editPlaylist" && selectedPlaylist) {
    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        setEditPreviewUrl(preview);
        setEditImageFile(file);
      }
    };

    const handleSaveEdit = async () => {
      setEditError("");

      let finalPictureUrl = editPreviewUrl;

      if (!editName) {
        setEditError("กรุณาใส่ชื่อ Playlist");
        return;
      }

      if (editImageFile) {
        try {
          finalPictureUrl = await uploadImageToR2(editImageFile);
        } catch (err: any) {
          setEditError("อัปโหลดรูปไม่สำเร็จ: " + err.message);
          return;
        }
      }

      try {
        const res = await fetch(`/api/playlist`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playlistId: selectedPlaylist.id,
            name_playlist: editName,
            picture: finalPictureUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "ไม่สามารถแก้ไข Playlist ได้");

        alert("แก้ไข Playlist สำเร็จ");
        console.log(data)
        setView(null);
      } catch (err: any) {
        setEditError(err.message);
      }
    };

    return (
      <div className="w-80 p-4 space-y-4 bg-gradient-to-t from-black to-[#252525] duration-200 h-full flex flex-col">
        <h2 className="text-xl font-bold pb-2">Edit Playlist</h2>

        <div className="flex flex-col items-center justify-center my-2 space-y-2">
          <div className="space-y-4 w-48 h-fit rounded-lg">
            <SongCover
              songId={selectedPlaylist?.id ?? 0}
              picture={editPreviewUrl}
              name="editPreview"
              onImageChange={(file) => {
                const preview = URL.createObjectURL(file);
                setEditPreviewUrl(preview);
                setEditImageFile(file);
              }}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleEditFileChange}
          />
        </div>

        <input
          className="w-full p-2 rounded bg-neutral-700"
          placeholder="Playlist name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />

        {editError && <p className="text-red-400 text-sm">{editError}</p>}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleSaveEdit}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold"
          >
            Save Changes
          </button>

          <button
            onClick={() => setView(null)}
            className="w-full py-2 rounded-lg bg-zinc-700 text-white"
          >
            Cancel
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
      <div className="h-screen w-full">
        <h1 className="text-white font-bold text-3xl">Recent</h1>
        <div className="flex flex-col">
          <div className="h-72 w-full mt-5 overflow-auto">
            <Card />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-2">Short Songs</h2>

          {/* ใช้ ShortSongFeed แทน div map เดิม */}
          <ShortSongFeed
            shortsongs={shortSongs}
            onSongClick={(index) => {
              setCurrentShortIndex(index);  // modal รู้ว่ากดเพลงไหน
              setModalOpen(true);           // เปิด modal
            }}
          />

          {/* Modal ของ Short Songs */}
          {modalOpen && currentShortIndex !== null && (
            <ShortSongModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              shortsongs={shortSongs}
              initialIndex={currentShortIndex}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
