"use client";

import { useEffect, useState } from "react";
import { useGeneratedPlaylist } from "@/app/context/GeneratedPlaylistContext";
import { Song } from "@/components/types";
import Smallpic from "@/components/cover_pic/Smallpic";
import { uploadImageToR2 } from "@/lib/uploadImage";
import Cover from "@/components/cover_pic/Aipic/pic_cover";
import LoadingOverlay from "@/components/Loadingoveray/page"; 

const AIGenResultPage = () => {
  const {
    songIds,
    playlistName: initialPlaylistName,
    pictureUrl: initialPictureUrl,
    reason,
  } = useGeneratedPlaylist();

  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState(initialPlaylistName);
  const [pictureUrl, setPictureUrl] = useState(initialPictureUrl);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false); 

  useEffect(() => {
    async function fetchSongs() {
      const res = await fetch("/api/song");
      const data = await res.json();
      setSongs(data.songs);
    }
    fetchSongs();
  }, []);

  const selectedSongs = songIds
    .map((id) => songs.find((s) => s.id === Number(id)))
    .filter((s): s is Song => !!s);

  function handleImageUpload(file: File) {
    if (file) {
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPictureUrl(previewUrl);
      setSaveMessage("เลือกรูปใหม่แล้ว (ยังไม่อัปโหลด)");
    }
  }

  useEffect(() => {
    return () => {
      if (pictureUrl && pictureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pictureUrl);
      }
    };
  }, [pictureUrl]);

  async function handleSavePlaylist() {
    try {
      setIsSaving(true); //  เริ่มโหลด

      let finalPictureKey = pictureUrl;
      if (selectedImageFile) {
        finalPictureKey = await uploadImageToR2(selectedImageFile);
      }

      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_playlist: playlistName,
          picture: finalPictureKey,
          song: songIds.map(Number),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Save failed: " + data.error);
        return;
      }

      setSaveMessage("Playlist ถูกบันทึกแล้ว");
    } catch (err: any) {
      setError("❌ " + err.message);
    } finally {
      setIsSaving(false); 
    }
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-white relative">
      {/* Overlay โหลด */}
      <LoadingOverlay show={isSaving} />

      {/* ส่วนบน: ปก  ข้อมูล playlist */}
      <div className="flex flex-col md:flex-row p-10 space-y-6 md:space-y-0 md:space-x-10 bg-black/60">
        {/* Cover */}
        <Cover
          picture={pictureUrl}
          name="Playlist Cover"
          onImageChange={handleImageUpload}
        />

        {/* ข้อมูล Playlist */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Input + ปุ่ม Save */}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="ชื่อ Playlist"
              className="flex-1 p-2 rounded text-white text-xl font-bold "
            />
            <button
              onClick={handleSavePlaylist}
              disabled={isSaving}
              className="px-5 py-3 bg-violet-600 text-white hover:bg-violet-700 transition cursor-pointer rounded-3xl disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Playlist"}
            </button>
          </div>

          <p className="mt-2 text-gray-400">AI Generated Playlist</p>

          {saveMessage && (
            <p className="mt-2 text-green-500 font-medium">{saveMessage}</p>
          )}
          {error && (
            <p className="mt-2 text-red-500 font-medium">{error}</p>
          )}

          {reason && (
            <div className="mt-4 bg-neutral-800 p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-1 text-gray-300">
                เหตุผล:
              </h3>
              <p className="text-gray-400 whitespace-pre-wrap">{reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* รายการเพลง */}
      <div className="px-8 lg:px-10 pb-8">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-400 border-b border-neutral-700/50 mb-4">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 lg:col-span-5">Title</div>
          <div className="hidden lg:block lg:col-span-3">Upload by</div>
          <div className="col-span-4 lg:col-span-2 text-center"></div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-1">
          {selectedSongs.map((song, index) => (
            <div
              key={song.id}
              className="group grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-neutral-800/50 transition-all duration-200"
            >
              <div className="col-span-1 text-center text-gray-400 group-hover:text-white">
                {index + 1}
              </div>

              <div className="col-span-6 lg:col-span-5 flex items-center space-x-3">
                <div className="w-12 h-12 relative flex-shrink-0 rounded">
                  <Smallpic picture={song.picture ?? ""} name={song.name_song} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate group-hover:text-violet-500 transition">
                    {song.name_song}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {song.uploader?.name || song.uploaded_by}
                  </p>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-3 text-gray-400 text-sm truncate">
                {song.uploader?.name || song.uploaded_by}
              </div>

              <div className="col-span-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIGenResultPage;
