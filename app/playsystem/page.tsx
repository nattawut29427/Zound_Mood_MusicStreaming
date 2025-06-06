// app/page.tsx
"use client";
import { ScrollAreaHorizontalDemo } from "@/components/ui/ScrollAreaHorizontalDemo";

export default function HomePage() {
  return (
    <div className="p-10 space-y-10">
      <div className="overflow-x-auto">
        <ScrollAreaHorizontalDemo />
      </div>

      <div>
        <h1 className="text-white font-bold text-4xl">Topic</h1>
        <div className="mt-8 flex gap-4">
          {/* เอา card เพลงมาใส่ตรงนี้ */}
        </div>
      </div>
    </div>
  );
}
