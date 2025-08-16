"use client";
import React from "react";
import Card from "@/components/profile/Card";
import Navigator from "@/components/profile/Navigator";
import { useSession } from "next-auth/react";
import Image from "next/image";
import FollowBt from "@/components/button/FollowBt";

export default function Profile() {
  const { data: session, status } = useSession();

  return (
    <div className="mb-20">
      {/* Banner */}
      <div>
        <Card />
      </div>

      {/* Profile image */}
      {status === "authenticated" && session ? (
        <div className="relative w-full ">
          <Image
            src={session.user?.image || "/2.jpg"}
            alt="avatar"
            width={110}
            height={110}
            className="absolute -top-10 left-17 rounded-full cursor-pointer hover:opacity-80  duration-300"
          ></Image>
        </div>
      ) : (
        <div className="w-34 h-34 bg-gray-900 absolute -top-15 left-10 rounded-full"></div>
      )}
      {/* Name and Edit button */}
      <div className="flex items-center justify-between pl-52 mt-4">
        {status === "authenticated" && session ? (
          <h2 className="text-xl font-bold">{session.user?.username}</h2>
        ) : (
          <h2 className="text-xl font-bold"></h2>
        )}
        <div className="flex items-center gap-2 pr-6">
          {/* <button className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer">
            Edit profile
          </button> */}
          <FollowBt/>
          <button className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm  cursor-pointer">
            Share
          </button>
        </div>
      </div>

      <div>
        {/* Navigator */}
        <div className="mt-6 ">
          <Navigator />
        </div>
      </div>
    </div>
  );
}
