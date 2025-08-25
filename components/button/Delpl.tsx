"use client";

import React from "react";
import { MinusCircle } from "lucide-react";

type DelplProps = {
  playlistIdToDelete: number;
  songId: number;
};

export default function Delpl({ playlistIdToDelete, songId }: DelplProps) {
  async function handleDel() {
    try {
      const response = await fetch("/api/playlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlistIdToDelete,
          songId: songId,
        }),
      });

      if (response.ok) {
        alert("Playlist deleted successfully");
      } else {
        alert("Failed to delete playlist");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  }

  return (
    <div>
      <MinusCircle
        onClick={handleDel}
        className="w-5 h-5  text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200"
      />
    </div>
  );
}
