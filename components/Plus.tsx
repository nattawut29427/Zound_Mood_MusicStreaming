// AddToPlaylistButton.tsx
"use client";
import { CirclePlus } from "lucide-react";
import { useSidebar } from "@/app/context/SidebarContext";

export default function AddToPlaylistButton({
  songId,
  picture,
}: {
  songId: number;
  picture: string;
}) {
  const { setView } = useSidebar();

  return (
    <CirclePlus
      className="w-8 h-8 hover:text-blue-500 cursor-pointer"
      onClick={() => setView("createPlaylist", { id: songId, picture })}
    />
  );
}   
