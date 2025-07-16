"use client";

import { useState } from "react";
import { Howl } from "howler";

export default function AudioTrimPreviewer() {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handlePreview = () => {
    if (!file) return;
    const sound = new Howl({
      src: [URL.createObjectURL(file)],
      html5: true,
      onplay: () => {
        sound.seek(startTime);
        setTimeout(() => sound.pause(), duration * 1000);
      },
    });
    sound.play();
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start", String(startTime));
    formData.append("duration", String(duration));

    try {
      const res = await fetch("/api/trim", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text(); // fallback ถ้าไม่ใช่ JSON
        console.error("❌ Upload failed:", text);
        alert("เกิดข้อผิดพลาดในการตัดเสียง");
        return;
      }

      const json = await res.json();
      setUploadedUrl(json.url);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">🎧 ตัดเสียง + Upload R2</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div>
        Start Time (s):{" "}
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
        />
      </div>
      <div>
        Duration (s):{" "}
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      <button
        onClick={handlePreview}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        🔊 Preview
      </button>
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        ☁️ ตัด + อัปโหลด
      </button>

      {uploadedUrl && (
        <div>
          ✅ ไฟล์อัปโหลด:{" "}
          <a
            href={uploadedUrl}
            target="_blank"
            className="underline text-blue-600"
          >
            ดู / ดาวน์โหลด
          </a>
        </div>
      )}
    </div>
  );
}
