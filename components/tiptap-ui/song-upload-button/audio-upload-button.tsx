"use client";

import { useState } from "react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import dynamic from "next/dynamic";
import { AudioLines } from "lucide-react";

const SelectMusicModal = dynamic(
  () => import("@/components/tiptap-ui/song-upload-button/select-music-modal"),
  {
    ssr: false,
  }
);

export function AudioUploadButton({
  text = "Add",
  onMusicSelect,
}: {
  text?: string;
  onMusicSelect?: (data: {
    song_id: number;
    audioUrl: string;
    start: number;
    duration: number;
  }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <div className="text-sm">
          <AudioLines />
        </div>
        {text}
      </Button>

      {open && (
        <SelectMusicModal
          onClose={() => setOpen(false)}
          onSelect={(data) => {
            console.log("เพลงถูกเลือก:", data);
            setOpen(false);
            if (onMusicSelect) {
              onMusicSelect(data);
            }
          }}
        />
      )}
    </>
  );
}
