"use client";
import React, { useState, useEffect } from "react";
import { Song } from "@/components/types";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);

  const [playlistName, setPlaylistName] = useState("My AI Playlist");
  const [pictureUrl, setPictureUrl] = useState(
    "https://i.pinimg.com/736x/8a/da/ff/8adafffbab914e5f2f3b487b9037dbdc.jpg"
  );

  const [songIds, setSongIds] = useState<string[]>([]);

  // Load songs from API /api/songs
  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/song");
        const data = await res.json();
        setSongs(data.songs as Song[]);
      } catch {
        setError("Failed to load songs");
      } finally {
        setLoadingSongs(false);
      }
    }
    fetchSongs();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setPlaylist([]);
    setReason("");

    try {
      const res = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, songs }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        setPlaylist(data.playlist || []);
        setSongIds(data.playlist || []);
        setReason(data.reason || "");
      }
    } catch {
      setError("Connection error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePlaylist() {
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_playlist: playlistName,
          picture: pictureUrl,
          song: songIds.map(Number),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Save failed: " + data.error);
        return;
      }

      alert("Playlist saved successfully!");
    } catch {
      setError("Connection error occurred");
    }
  }

  return (
    <main className="max-w-2xl mx-auto my-8 p-6 font-sans bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🎵 สร้าง Playlist ด้วย AI
      </h1>

      <textarea
        placeholder="อยากฟังเพลงแบบไหน เช่น เพลงเหงา ๆ วันที่ฝนตก"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim() || loadingSongs}
        className="mt-3 px-4 py-2 text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Playlist"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
        🎶 เพลงจากฐานข้อมูล
      </h2>
      {loadingSongs ? (
        <p className="text-gray-600">กำลังโหลดเพลง...</p>
      ) : (
        <ul className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
          {songs.map((song) => (
            <li
              key={song.id}
              className="text-gray-700 py-1 border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium">{song.name_song}</span> -{" "}
              <span className="text-gray-600">{song.uploader?.name}</span>
            </li>
          ))}
        </ul>
      )}

      {playlist.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            🎧 Playlist ที่ได้
          </h2>
          <ol className="space-y-2 bg-gray-50 p-4 rounded-md">
            {playlist.map((id, index) => {
              const song = songs.find((s) => s.id === Number(id));
              return (
                <li key={id} className="flex items-center space-x-3">
                  <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">
                    <span>{song ? `${song.name_song} - ${song.uploader?.name || song.uploaded_by}` : id}</span>


                  </span>
                </li>
              );
            })}
          </ol>

          {reason && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                📝 เหตุผลที่ AI เลือกเพลงเหล่านี้:
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{reason}</p>
            </div>
          )}

          <hr className="my-6 border-gray-300" />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">
              💾 บันทึก Playlist
            </h3>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="ชื่อ Playlist"
              className="w-full p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="ลิงก์รูปภาพ Playlist"
              className="w-full p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSavePlaylist}
              className="px-4 py-2 text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
            >
              💾 Save Playlist
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
