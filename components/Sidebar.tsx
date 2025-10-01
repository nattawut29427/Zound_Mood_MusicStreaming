// components/Sidebar.tsx
"use client";
import Link from "next/link";
import {
  ListMusic,
  Heart,
  BookOpen,
  Bot,
  Settings,
  Sparkles,
  LayoutDashboard,
  Clapperboard
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-32 p-4 rounded-t-xl bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between h-full">
      {/* ส่วนบน: ลิงก์ทั้งหมด */}
      <div className="flex flex-col items-center gap-12 mt-8 text-white font-semibold text-sm">
        <Link href="/you/playlists" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <ListMusic className="w-5 h-5" />
          <span>Play lists</span>
        </Link>
        <Link href="/you/like" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <Heart className="w-5 h-5" />
          <span>Like</span>
        </Link>
        <Link href="/ai" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <Sparkles className="w-5 h-5" />
          <span>Ai</span>
        </Link>
        <Link href="/you/diary" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <BookOpen className="w-5 h-5" />
          <span>Diary</span>
        </Link>
        <Link href="/short" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <Clapperboard className="w-5 h-5" />
          <span>Short</span>
        </Link>
         <Link href="/you/dashboard" className="flex flex-col items-center gap-1 hover:text-gray-400">
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* ส่วนล่าง: Settings */}
      <div className="flex flex-col mb-20 items-center gap-1 text-white font-semibold text-sm">
        <Settings className="w-5 h-5 cursor-pointer" />
        <span>Settings</span>
      </div>
    </aside>
  );
}
