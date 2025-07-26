"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SelectMusicPage from "@/app/(main)/test_trim/page";

export default function SelectMusicModal({
  onClose,
  onSelect, // เปลี่ยนจาก onSubmit เป็น onSelect
}: {
  onClose: () => void;
  onSelect: (data: {
    song_id: number;
    audioUrl: string;
    start: number;
    duration: number;
  }) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-10 mb-20">
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div
        className={`absolute bottom-0 right-0 w-full sm:w-[420px] h-[76vh] bg-neutral-900 shadow-xl overflow-hidden transform transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectMusicPage
          onSelect={(data) => {
            onSelect(data); // ส่งข้อมูลเพลงกลับไป parent
            handleClose();
          }}
        />
      </div>
    </div>,
    document.body
  );
}
