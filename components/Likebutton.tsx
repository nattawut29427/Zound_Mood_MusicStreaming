"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

type LikeButtonProps = {
  songId: number;
  initialLiked?: boolean;
};

export default function LikeButton({ songId, initialLiked = false }: LikeButtonProps) {
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
    <Heart
      onClick={toggleLike}
      className={`w-8 h-8 cursor-pointer transition-colors ${
        liked ? "text-red-500" : "text-white hover:text-red-400"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
    />
  );
}
