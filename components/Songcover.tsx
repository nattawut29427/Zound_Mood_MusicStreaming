"use client";

import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import Image from "next/image";
import { useRef, useState } from "react";

export default function SongCover({
  picture,
  name,
  onImageChange,
}: {
  picture: string;
  name: string;
  onImageChange?: (file: File) => void;
}) {
 const rawSignedUrl = useCachedSignedUrl(picture);
const isBlobUrl = picture.startsWith("blob:");
const signedUrl = isBlobUrl ? picture : rawSignedUrl;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  if (!picture)
    return (
      <div className="w-48 h-48 flex items-center justify-center text-gray-400">
        No image
      </div>
    );

  return (
    <div className="relative w-48 h-48 group">
      {/* รูปภาพ */}
      {signedUrl && !error && (
        <Image
          src={signedUrl}
          alt={name}
          fill
          className={`object-cover rounded-md transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoadingComplete={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          style={{ zIndex: 10, pointerEvents: "none" }}
        />
      )}

      {/* พื้นหลังมืด (เฉพาะตอน hover) */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition z-20 pointer-events-none duration-300" />

      {/* ปุ่ม Upload */}
      {onImageChange && (
        <>
          <div className="absolute inset-0 flex items-center justify-center z-40 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-3 py-1 rounded-full hover:bg-gray-300 cursor-pointer transition"
            >
              Upload new image
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
