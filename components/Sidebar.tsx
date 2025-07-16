// components/Sidebar.tsx
"use client";
import Link from "next/link";
import {
  ListMusic,
  Heart,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-32 p-4 rounded-t-xl bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center gap-12 mt-8 text-white font-semibold text-sm">
        <Link href="/you/playlists" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <ListMusic className="w-5 h-5" />
          <span>Play lists</span>
        </Link>
        <Link href="/you/like" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <Heart className="w-5 h-5" />
          <span>Like song</span>
        </Link>
        <Link href="/you/diary" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <BookOpen className="w-5 h-5" />
          <span>Dairy</span>
        </Link>
        <Link href="/ai" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <Bot className="w-5 h-5" />
          <span>Ai</span>
        </Link>
        <div className="mt-24 flex flex-col items-center gap-1">
          <Settings className="w-5 h-5 text-white cursor-pointer" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
