"use client";

import React from "react";

type FollowBtProps = {
  isFollowing?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function FollowBt({
  isFollowing = false,
  onClick,
  disabled = false,
  className = "",
  children,
}: FollowBtProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white text-black px-4 py-1 font-bold rounded-full cursor-pointer hover:scale-110 duration-300
        ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}
        ${className}`}
    >
      {children ?? (isFollowing ? "Following" : "Follow")}
    </button>
  );
}
