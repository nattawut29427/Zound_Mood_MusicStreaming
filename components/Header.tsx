// components/Header.tsx
"use client";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Ghost } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-black p-6 h-16 w-full sticky top-0 z-10 mb-4 flex items-center justify-between">
      <div className="text-white font-bold text-2xl">
        <AuroraText>Logo</AuroraText>
      </div>
      <div className="flex-1 max-w-lg ml-40 pt-2.5 ">
        <input
          type="text"
          placeholder="Type your song..."
          className="w-full h-10 px-4  rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/feed">
          <Button size="lg" className="rounded-full text-white cursor-pointer" variant="ghost">Feed</Button>
        </Link>
        <div className="bg-white h-10 rounded-full w-1 bg-gradient-to-b from-red-500 to-pink-400"></div>
        <Link href="/upload">
          <Button size="lg" className="rounded-full text-white cursor-pointer" variant="ghost">Upload</Button>
        </Link>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
