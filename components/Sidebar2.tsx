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
    <aside className="w-78 p-4 bg-gradient-to-t from-black from-[10%] to-[#252525] shadow-xl flex flex-col justify-between">
      <div>
        <h1 className="text-white font-bold text-3xl">TOPIC</h1>
      </div>
    </aside>
  );
}
