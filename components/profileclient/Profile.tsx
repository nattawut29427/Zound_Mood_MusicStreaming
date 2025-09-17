"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/profile/Card";
import Navigator from "@/components/profile/Navigator";
import FollowUserWrapper from "@/components/button/Bt";
import EditProfile from "../profile/button/EditProfile";
import { useSignedImage } from "@/lib/hooks/useSignedImage";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;       // ไม่เป็น nullable
    email: string;      // ต้องมี
    image?: string;
    bg_image?: string;
    isFollowing?: boolean;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === user.id;
  const signedUrl = useSignedImage(user.image)

  return (
    <div className="mb-20">
      {/* Banner */}
      <Card
        userId={user.id} 
        initialBg={user.bg_image || ""}
        isOwner={isOwner} 
      />

      {/* Profile image */}
      <div className="relative w-full flex justify-center">
        {signedUrl || (user.image && user.image.startsWith("http")) ? (
          <Image
            src={signedUrl || user.image!}
            alt="avatar"
            width={110}
            height={110}
            className="absolute -top-10 left-10 rounded-full cursor-pointer hover:opacity-80 duration-300"
          />
        ) : (
          // Skeleton avatar
          <div className="absolute -top-10 left-10 w-[110px] h-[110px] rounded-full bg-gray-300 animate-pulse" />
        )}
      </div>
      {/* Name + buttons */}
      <div className="flex items-center justify-between mt-4 px-6">
        <h2 className="text-xl pl-36 font-bold">{user.name ?? "Unknown"}</h2>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <EditProfile
              user={{
                id: user.id,
                name: user.name,
                image: user.image,
                bg_image: user.bg_image,
              }}
            />
          ) : (
            <FollowUserWrapper
              userIdToFollow={user.id}
              initialIsFollowing={user.isFollowing ?? false}
            />
          )}
          {/* <button className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm cursor-pointer">
            Share
          </button> */}
        </div>
      </div>

      {/* Navigator */}
      <div className="mt-6">
        <Navigator userId={user.id} />
      </div>
    </div>
  );
}
