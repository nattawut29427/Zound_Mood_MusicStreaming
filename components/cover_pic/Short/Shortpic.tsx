"use client";

import Image from "next/image";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";

export default function SongCover({
  picture,
  name,
}: {
  picture: string;
  name: string;
}) {
  const signedUrl = useCachedSignedUrl(picture);

  return (
    <div className="overflow-hidden cursor-pointer w-full h-52 md:h-64 lg:h-screen relative">
      <Image
        src={signedUrl || "/default-cover.jpg"}
        alt={name}
        fill
        className="object-cover hover:scale-110 transition-transform duration-300 "
      />
    </div>
  );
}
