"use client";
import Image from "next/image";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

interface ProfileProps {
  imageKey: string;
}

export default function Profile({ imageKey }: ProfileProps) {
  const signedUrl = useSignedImage(imageKey);

  if (!signedUrl)
    return <div className="w-10 h-10 rounded-full bg-gray-400" />;

  return (
    <Image
      src={signedUrl}
      alt="User Avatar"
      width={30}
      height={30}
      className="rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-300"
    />
  );
}