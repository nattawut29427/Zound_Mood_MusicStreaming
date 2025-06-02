"use client";

import { useState } from "react";

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("กำลังอัปโหลด...");

    try {
      const res = await fetch(`/api/upload-url?filename=${encodeURIComponent(file.name)}`);
      const { url, key } = await res.json();

      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      setMessage("✅ อัปโหลดสำเร็จ!");
      setFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      setMessage("❌ อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">อัปโหลดรูปภาพ</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="mb-4 w-full max-h-64 object-contain border rounded"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
