// app/page.tsx
"use client";
import { ScrollAreaHorizontalDemo } from "@/components/ui/ScrollAreaHorizontalDemo";

export default function HomePage() {
  return (
    <div>
      <div className="overflow-x-auto">
        <ScrollAreaHorizontalDemo />
      </div>

      <div>
        <h1 className="text-white font-bold text-4xl">Topic</h1>
        <div className="mt-8 flex gap-4"></div>
      </div>
    </div>
  );
}
