"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "@/app/context/SidebarContext";

export default function PathWatcher() {
  const pathname = usePathname();
  const { setView } = useSidebar();

  useEffect(() => {
    // ทุกครั้งที่ pathname เปลี่ยน → reset view
    setView("default");
  }, [pathname]);

  return null;
}
