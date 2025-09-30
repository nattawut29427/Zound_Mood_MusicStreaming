"use client";

import React, { useState } from "react";
import FollowBt from "./FollowBt";

type FollowUserWrapperProps = {
  initialIsFollowing: boolean;
  userIdToFollow: string;
};

export default function FollowUserWrapper({
  initialIsFollowing,
  userIdToFollow,
}: FollowUserWrapperProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function handleToggleFollow() {
    setLoading(true);

    try {
      const response = await fetch("/api/service/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdToFollow, follow: !isFollowing }),
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        alert("Failed to update follow status");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FollowBt
      isFollowing={isFollowing}
      onClick={handleToggleFollow}
      disabled={loading}
      userIdToFollow={userIdToFollow}
    />
  );
}
