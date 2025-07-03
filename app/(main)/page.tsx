// app/page.tsx
"use client";
import { ScrollAreaHorizontalDemo } from "@/components/ui/ScrollAreaHorizontalDemo";

export default function HomePage() {
  return (
    <div>
      <div className="overflow-x-auto">
        <ScrollAreaHorizontalDemo />
      </div>

     
    </div>
  );
}
