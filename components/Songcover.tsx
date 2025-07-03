"use client";

import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import Image from "next/image";
import Loading from "./loading/Loading";
import { useState } from "react";

export default function SongCover({
  picture,
  name,
}: {
  picture: string;
  name: string;
}) {
  const signedUrl = useCachedSignedUrl(picture);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!picture)
    return (
      <div className="w-48 h-48  flex items-center justify-center text-gray-400">
        No image
      </div>
    );

  return (
    <div className="relative w-48 h-48">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center ">
          <Loading />
        </div>
      )}

      <Image
        src={signedUrl ?? "/default-cover.jpg"}
        alt={name}
        width={228}
        height={228}
        className={`object-cover rounded-md transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400 z-20">
          Image failed to load
        </div>
      )}
    </div>
  );
}
