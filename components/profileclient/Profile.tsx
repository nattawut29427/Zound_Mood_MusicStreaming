"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/profile/Card";
import Navigator from "@/components/profile/Navigator";
import FollowUserWrapper from "@/components/button/Bt";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    isFollowing?: boolean;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === user.id;

  return (
    <div className="mb-20">
      {/* Banner */}
      <Card />

      {/* Profile image */}
      <div className="relative w-full flex justify-center">
        <Image
          src={user.image || "/2.jpg"}
          alt="avatar"
          width={110}
          height={110}
          className="absolute -top-10 left-10 rounded-full cursor-pointer hover:opacity-80 duration-300 "
        />
      </div>

      {/* Name + buttons */}
      <div className="flex items-center justify-between mt-4 px-6">
        <h2 className="text-xl pl-36 font-bold">{user.name ?? "Unknown"}</h2>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <button className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm cursor-pointer">
              Edit profile
            </button>
          ) : (
             <FollowUserWrapper
              userIdToFollow={user.id}
              initialIsFollowing={user.isFollowing ?? false} 
            />
          )}
          <button className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm cursor-pointer">
            Share
          </button>
        </div>
      </div>

      {/* Navigator */}
      <div className="mt-6">
        <Navigator userId={user.id}/>
      </div>
    </div>
  );
}
