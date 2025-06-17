"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  //   const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // เก็บชื่อไฟล์ไว้ข้ามหน้า (หรือจะใช้ context ก็ได้)
      localStorage.setItem("uploadedFileName", file.name);

      // ไปหน้าถัดไปทันที
      router.push("/newupload/formupload");
    }
  };

  return (
    <>
      <div className="text-white font-bold text-3xl ">Upload your song</div>
      <div className="flex  items-center justify-center ">
        <div className="w-full max-w-screen mt-10">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed  border-white rounded-2xl h-76 cursor-pointer transition hover:bg-white/10"
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
