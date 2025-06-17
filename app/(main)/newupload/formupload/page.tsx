"use client";

import React from "react";
import { useState } from "react";

export default function Page() {
  const [nameSong, setNameSong] = useState("");
  const [message, setMessage] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPicture(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !nameSong || !picture) {
      setMessage("กรุณาเลือกไฟล์เพลงและรูปภาพ และใส่ชื่อเพลงก่อน");
      return;
    }

    try {
      // key สำหรับเพลงและภาพ
      const songKey = `songs/${Date.now()}_${file.name}`;
      const picKey = `pictures/${Date.now()}_${picture.name}`;

      //  สำหรับอัปโหลดไฟล์เพลง
      const songUrlRes = await fetch(
        `/api/upload?key=${encodeURIComponent(
          songKey
        )}&contentType=${encodeURIComponent(file.type)}`
      );
      if (!songUrlRes.ok) throw new Error("ขอ signed URL สำหรับเพลงล้มเหลว");
      const { url: songUploadUrl } = await songUrlRes.json();

      const songUploadRes = await fetch(songUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!songUploadRes.ok) throw new Error("อัปโหลดเพลงล้มเหลว");

      // สำหรับอัปโหลดรูปภาพ
      const picUrlRes = await fetch(
        `/api/upload?key=${encodeURIComponent(
          picKey
        )}&contentType=${encodeURIComponent(picture.type)}`
      );
      if (!picUrlRes.ok) throw new Error("ขอ signed URL สำหรับรูปภาพล้มเหลว");
      const { url: picUploadUrl } = await picUrlRes.json();

      const picUploadRes = await fetch(picUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": picture.type },
        body: picture,
      });
      if (!picUploadRes.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

      // บันทึก DB
      const saveRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_song: nameSong,
          audio_urlKey: songKey,
          pictureKey: picKey,
          uploaded_by: 1,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        setMessage("บันทึกข้อมูลเพลงล้มเหลว: " + (saveData.error || ""));
        return;
      }

      setMessage("อัปโหลดเพลงและรูปภาพสำเร็จ!");
      // setFile(null);
      setPicture(null);
      setNameSong("");
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return (
    <div className="text-white">
      <div className="font-bold text-3xl mb-8">Upload your song</div>

      <div className="flex flex-wrap gap- justify-between">
        {/* ซ้าย: อัปโหลดไฟล์ */}
        <div className="w-72">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-white rounded-2xl h-72 cursor-pointer transition hover:bg-white/10"
          >
            <div className="text-white font-semibold text-lg">
              Upload file here
            </div>
            <div className="text-sm text-gray-400 mt-1">
              (Only .jpg, .png files)
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* ขวา: test หรือฟอร์มอื่น */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <label className="text-white font-medium">Track title</label>
          <input
            type="text"
            placeholder="Type your track title"
            className="p-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />

          <label className="text-white font-medium">Tag</label>
          <input
            type="text"
            placeholder="Type your tag"
            className="p-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />

          <label className="text-white font-medium">Description</label>
          <textarea
            rows={4}
            placeholder="Additional description"
            className="p-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button onClick={handleUpload} className="bg-pink-500 text-white font-semibold py-2 px-6 rounded-2xl">
          Upload
        </button>
      </div>
    </div>
  );
}
