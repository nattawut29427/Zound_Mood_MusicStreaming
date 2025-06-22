"use client";

import { useSignedImage } from "@/lib/hooks/useSignedImage";
import Image from "next/image";

export default function SongCover({
  picture,
  name,
}: {
  picture: string;
  name: string;
}) {
  const signedUrl = useSignedImage(picture);

  return (
    <>
      {signedUrl ? (
        <Image src={signedUrl} alt={name} width={228} height={100} />
      ) : (
        <Image
          src="/default-cover.jpg"
          alt="default cover"
          width={228}
          height={100}
        />
      )}
    </>
  );
}
