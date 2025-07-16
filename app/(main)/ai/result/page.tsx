"use client";

import { useEffect, useState } from "react";
import { useGeneratedPlaylist } from "@/app/context/GeneratedPlaylistContext";
import { Song } from "@/components/types";
import Smallpic from "@/components/cover_pic/Smallpic";
import { uploadImageToR2 } from "@/lib/uploadImage";
import SongCover from "@/components/Songcover";

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
    setSaveMessage("📸 เลือกรูปใหม่แล้ว (ยังไม่อัปโหลด)");
  }
}

function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (file) {
    handleImageUpload(file);
  }
}

  useEffect(() => {
    // cleanup preview URL 
    return () => {
      if (pictureUrl && pictureUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pictureUrl);
      }
    };
  }, [pictureUrl]);

  async function handleSavePlaylist() {
    try {
      let finalPictureKey = pictureUrl;

      if (selectedImageFile) {
        // อัปโหลดไฟล์ไปยัง R2 แล้วรับ key กลับมา
        finalPictureKey = await uploadImageToR2(selectedImageFile);
      }

      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_playlist: playlistName,
          picture: finalPictureKey, // ใช้ key ที่ upload สำเร็จ
          song: songIds.map(Number),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Save failed: " + data.error);
        return;
      }

      alert("Playlist saved successfully!");
      setSaveMessage("✅ Playlist ถูกบันทึกแล้ว");
    } catch (err: any) {
      setError("❌ " + err.message);
    }
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูล playlist */}
      <div className="flex flex-col md:flex-row p-10 space-y-6 md:space-y-0 md:space-x-10 bg-black/60">
        {/* Cover + ปรับลิงก์รูป */}
        
          <SongCover picture={pictureUrl} name="Playlist Cover" onImageChange={handleImageUpload} />
    

        {/* แก้ชื่อ + เหตุผล */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="ชื่อ Playlist"
              className="w-full p-2 rounded text-white text-xl font-bold"
            />
            <p className="text-gray-400">AI Generated Playlist</p>
          </div>

          {reason && (
            <div className="mt-4 bg-neutral-800 p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-1 text-gray-300">
                🧠 เหตุผล:
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
                  <p className="font-medium text-white truncate group-hover:text-blue-500 transition">
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

        {/* Save Playlist Section */}
        <div className="mt-10">
          <button
            onClick={handleSavePlaylist}
            className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            💾 Save Playlist
          </button>

          {saveMessage && <p className="mt-4 text-green-500 font-medium">{saveMessage}</p>}
          {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AIGenResultPage;
