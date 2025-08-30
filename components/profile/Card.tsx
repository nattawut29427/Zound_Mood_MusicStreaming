"use client";

import React, { useRef, useState } from "react";
import { Check, X } from "lucide-react";



export default function Card({ userId }: { userId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgImage, setBgImage] = useState("/1.jpg");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  const handleConfirm = async () => {
    if (!previewImage) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/user/${userId}/bg`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setBgImage(data.url);
        setPreviewImage(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative w-full h-72 bg-gray-300 overflow-hidden group">
      <img
        src={previewImage || bgImage}
        alt="Profile Banner"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* ปุ่มตรงมุมขวาล่าง */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {!previewImage && (
          <button
            onClick={handleClick}
            className="bg-white/80 text-black px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-white duration-300"
          >
            Change background
          </button>
        )}

        {previewImage && (
          <>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="bg-red-500 text-white cursor-pointer px-4 py-2 rounded-full hover:bg-red-600 transition"
            >
              <X/>
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading}
             className="bg-white/80 text-black px-4 py-2 rounded-full text-sm cursor-pointer font-semibold shadow hover:bg-white duration-300">
              {uploading ? "Uploading..." : <Check/>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
