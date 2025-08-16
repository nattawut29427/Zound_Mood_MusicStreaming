"use client";

 import { useSignedImage } from "@/lib/hooks/useSignedImage";
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
    <>
      {signedUrl ? (
        <div className="flex w-max space-x-4 overflow-x-auto ">
          <div className="overflow-hidden rounded-md cursor-pointer">
            <Image
              src={signedUrl}
              alt={name}
              width={235}
              height={115}
              className="aspect-[4/4] h-44 w-fit object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md">
          <Image
            src="/default-cover.jpg"
            alt="default cover"
            className="aspect-[4/4] h-44 w-fit object-cover hover:scale-110 transition-transform duration-300"
            width={235}
            height={115}
          />
        </div>
      )}
    </>
  );
}
