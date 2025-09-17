"use client";

import React, { useRef, useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

export default function Card({
  userId,
  initialBg,
  isOwner = false, // default false
}: {
  userId: string;
  initialBg?: string;
  isOwner?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bgKey, setBgKey] = useState(initialBg || "");
  const [loading, setLoading] = useState(true);

  const signedUrl = useSignedImage(bgKey);
  const isBlobUrl = bgKey?.startsWith("blob:");
  const displayUrl = previewImage || (isBlobUrl ? bgKey : signedUrl);

  useEffect(() => {
    if (!isBlobUrl && signedUrl) {
      setLoading(false);
    } else if (isBlobUrl) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [signedUrl, isBlobUrl]);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!userId || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
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
        setBgKey(data.url);
        setPreviewImage(null);
        setLoading(true);
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
    setLoading(!bgKey);
  };

  return (
    <div className="relative w-full h-72 overflow-hidden group">
      {loading && (
        <div className="w-full h-full flex items-center justify-center bg-black/80 animate-pulse">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && displayUrl && (
        <img
          src={displayUrl}
          alt="Profile Banner"
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      )}

      {/* ✅ ปุ่มจะโชว์เฉพาะเจ้าของ profile เท่านั้น */}
      {isOwner && (
        <>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {!previewImage && (
              <button
                onClick={handleClick}
                disabled={uploading}
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
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
                >
                  <X />
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={uploading}
                  className="bg-white/80 text-black px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-white duration-300"
                >
                  {uploading ? "Uploading..." : <Check />}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
