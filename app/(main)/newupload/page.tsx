"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFile } from "@/app/context/Filecontext";

export default function Page() {
  const router = useRouter();

  const { setFile } = useFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      router.push("/newupload/formupload");
    }
  };
  return (
    <>
      <div className="text-white p-10 font-bold text-3xl">Upload your song</div>
      <div className="flex p-10 items-center justify-center">
        <div className="w-full max-w-screen mt-10">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-white rounded-2xl h-76 cursor-pointer transition hover:bg-white/10"
          >
            <div className="text-white font-semibold text-lg">
              Upload file here
            </div>
            <div className="text-sm text-gray-400 mt-1">
              (Only .mp3, .wav files)
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
}
