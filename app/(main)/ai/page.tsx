"use client";

import React, { useState, useEffect } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
};

export default function Home() {
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

  // โหลดเพลงจาก API /api/songs
  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/song");
        const data = await res.json();
        setSongs(data.songs || []);
      } catch {
        alert("โหลดเพลงไม่สำเร็จ");
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
        body: JSON.stringify({ prompt, songs }), // ใช้ songs ที่โหลดมาจาก DB
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
      } else {
        setPlaylist(data.playlist || []);
        setSongIds(data.playlist || []);
        setReason(data.reason || "");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
          song: songIds.map(Number), // แปลงเป็น number ถ้าจำเป็น
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("บันทึกไม่สำเร็จ: " + data.error);
        return;
      }

      alert("บันทึก Playlist สำเร็จ!");
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>🎵 สร้าง Playlist ด้วย AI</h1>

      <textarea
        placeholder="อยากฟังเพลงแบบไหน เช่น เพลงเหงา ๆ วันที่ฝนตก"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", padding: 8, fontSize: 16 }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim() || loadingSongs}
        style={{ marginTop: 12, padding: "8px 16px", fontSize: 16 }}
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Playlist"}
      </button>

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

      <h2>🎶 เพลงจากฐานข้อมูล</h2>
      {loadingSongs ? (
        <p>กำลังโหลดเพลง...</p>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              {song.name_song}  {song.artist}
            </li>
          ))}
        </ul>
      )}

      {playlist.length > 0 && (
        <>
          <h2>🎧 Playlist ที่ได้</h2>
          <ol>
            {playlist.map((id) => {
              const song = songs.find((s) => s.id === id);
              return <li key={id}>{song ? `${song.title} - ${song.artist}` : id}</li>;
            })}
          </ol>

          {reason && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#f0f0f0",
                borderRadius: 6,
                whiteSpace: "pre-wrap",
              }}
            >
              <h3>📝 เหตุผลที่ AI เลือกเพลงเหล่านี้:</h3>
              <p>{reason}</p>
            </div>
          )}

          <hr style={{ margin: "24px 0" }} />

          <h3>💾 บันทึก Playlist</h3>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="ชื่อ Playlist"
            style={{ width: "100%", padding: 8, fontSize: 16, marginBottom: 8 }}
          />
          <input
            type="text"
            value={pictureUrl}
            onChange={(e) => setPictureUrl(e.target.value)}
            placeholder="ลิงก์รูปภาพ Playlist"
            style={{ width: "100%", padding: 8, fontSize: 16, marginBottom: 12 }}
          />
          <button
            onClick={handleSavePlaylist}
            style={{ padding: "8px 16px", fontSize: 16 }}
            className="cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            💾 Save Playlist
          </button>
        </>
      )}
    </main>
  );
}
