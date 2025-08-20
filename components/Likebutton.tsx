"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

type LikeButtonProps = {
  songId: number;
  initialLiked?: boolean;
};

export default function LikeButton({
  songId,
  initialLiked = false,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!session?.user) {
      alert("Please log in first.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_id: songId }),
      });

      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
      } else {
        console.error("Like error:", data.error);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`w-10 h-10 flex items-center justify-center rounded-full 
        transition-all duration-200 shadow-md cursor-pointer
        ${liked ? "bg-red-100 hover:bg-red-200" : "bg-neutral-800 hover:bg-neutral-700"} 
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart
        className={`w-6 h-6 transition-colors duration-200 
          ${liked ? "fill-red-500 text-red-500" : "text-white hover:text-red-400"}`}
      />
    </button>
  );
}
