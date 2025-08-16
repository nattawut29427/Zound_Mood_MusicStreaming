"use client";

import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Play, Pause, Ellipsis } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SongCover({
  picture,
  name,
}: {
  picture: string;
  name: string;
}) {
  const rawSignedUrl = useCachedSignedUrl(picture);
  const isBlobUrl = picture.startsWith("blob:");
  const signedUrl = isBlobUrl ? picture : rawSignedUrl;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (picture.startsWith("blob:")) {
      setLoading(false);
    } else {
      setLoading(true);
      setError(false);
    }
  }, [picture]);

  if (!picture)
    return (
      <div className="w-48 h-48 flex items-center justify-center text-gray-400">
        No image
      </div>
    );

  return (
    <div className="relative w-20 h-20 group">
      {/* รูปภาพ */}

      {loading && !error && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-md" />
      )}

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

      {/* ปุ่ม Play/Pause */}
      <div className="absolute top-6 left-6  z-30 opacity-0 group-hover:opacity-100 transition"></div>

      {/* ปุ่ม ...
      <div className="absolute top-1 right-2 z-30 opacity-0 group-hover:opacity-100 transition">
        <button className="text-white p-2 rounded-full hover:bg-opacity-80 transition cursor-pointer hover:bg-black/55">
          <Ellipsis className="w-5 h-5" />
        </button>
      </div> */}

      {/* พื้นหลังมืดตอน hover */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition z-20 pointer-events-none duration-300" />

      <>
        <div className="absolute inset-0 flex items-center justify-center z-40 opacity-0 group-hover:opacity-100 transition">
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
        />
      </>
    </div>
  );
}
