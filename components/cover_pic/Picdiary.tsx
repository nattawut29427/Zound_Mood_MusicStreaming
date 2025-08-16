"use client";

import { useSignedImage } from "@/lib/hooks/useSignedImage";
import Image from "next/image";
import Loading from "@/components/loading/Loading";
import { useState } from "react";

export default function SongCover({
  picture,
  name,
}: {
  picture: string;
  name: string;
}) {
  const signedUrl = useSignedImage(picture);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loading />
        </div>
      )}

      {signedUrl && !error && (
        <Image
          src={signedUrl ?? "/default-cover.jpg"}
          alt={name}
          width={24}
          height={24}
          className={`object-cover rounded-full transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoadingComplete={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400 text-xs z-20">
          ❌
        </div>
      )}
    </div>
  );
}
