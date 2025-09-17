"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFile } from "@/app/context/Filecontext";

export default function Page() {
  const router = useRouter();
  const { setFile } = useFile();

  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!validTypes.includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ .mp3 และ .wav เท่านั้น");
      return;
    }

    // ตรวจสอบขนาดไฟล์ (เช่น < 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 50MB)");
      return;
    }

    // ผ่านการตรวจสอบ → เซ็ตไฟล์และไปต่อ
    setError("");
    setFile(file);
    router.push("/newupload/formupload");
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
              (Only .mp3, .wav files, max 50MB)
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* แสดง error ถ้ามี */}
          {error && (
            <p className="text-red-400 mt-4 text-center font-medium">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}
