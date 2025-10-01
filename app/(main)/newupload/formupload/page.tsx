"use client";

import React, { useState, useCallback, useRef } from "react";
import { useFile } from "@/app/context/Filecontext";
import { useSession } from "next-auth/react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/getCroppedImg";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function Page() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { file } = useFile();

  const [nameSong, setNameSong] = useState("");
  const [message, setMessage] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPicture(e.target.files[0]);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ✅ เพิ่ม Backspace เพื่อลบ tag ล่าสุด
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter หรือ Space เพื่อเพิ่ม tag
    if ((e.key === " " || e.key === "Enter") && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }

    // Backspace เพื่อลบ tag ล่าสุด และเอาค่ากลับมาแก้ในช่อง input
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      const lastTag = newTags.pop(); // ลบ tag สุดท้าย
      setTags(newTags);
      if (lastTag) setTagInput(lastTag); // เอาค่ามาแก้ใน input
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpload = async () => {
    if (!file || !nameSong || !picture) {
      setMessage("กรุณาเลือกไฟล์เพลงและรูปภาพ และใส่ชื่อเพลงก่อน");
      return;
    }

    setLoading(true);
    try {
      // Crop รูปก่อนอัปโหลด
      const croppedBlob = await getCroppedImg(picture, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], picture.name, { type: picture.type });

      const songKey = `songs/${Date.now()}_${file.name}`;
      const picKey = `pictures/${Date.now()}_${croppedFile.name}`;

      // signed URL เพลง
      const songUrlRes = await fetch(
        `/api/service/upload?key=${encodeURIComponent(songKey)}&contentType=${encodeURIComponent(file.type)}`
      );
      if (!songUrlRes.ok) throw new Error("ขอ signed URL สำหรับเพลงล้มเหลว");
      const { url: songUploadUrl } = await songUrlRes.json();

      await fetch(songUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // signed URL รูป
      const picUrlRes = await fetch(
        `/api/service/upload?key=${encodeURIComponent(picKey)}&contentType=${encodeURIComponent(croppedFile.type)}`
      );
      if (!picUrlRes.ok) throw new Error("ขอ signed URL สำหรับรูปภาพล้มเหลว");
      const { url: picUploadUrl } = await picUrlRes.json();

      await fetch(picUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": croppedFile.type },
        body: croppedFile,
      });

      // บันทึกข้อมูลเพลง
      const saveRes = await fetch("/api/service/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_song: nameSong,
          audio_urlKey: songKey,
          pictureKey: picKey,
          uploaded_by: userId,
          tag: tags.join(","),
          description,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        setMessage("บันทึกข้อมูลเพลงล้มเหลว: " + (saveData.error || ""));
        setLoading(false);
        return;
      }

      setMessage("อัปโหลดเพลงและรูปภาพสำเร็จ!");
      setPicture(null);
      setNameSong("");
      setTags([]);
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาด: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="text-white min-h-screen p-10 relative">
      {loading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-violet-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6">Upload Your Song</h1>

      {message && <p className="mb-6 text-center text-gray-300 font-medium">{message}</p>}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Picture Upload / Crop */}
        <div className="flex flex-col items-center w-full md:w-80">
          {!picture ? (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-white rounded-2xl h-72 w-full cursor-pointer hover:bg-white/10 transition"
            >
              <div className="text-white font-semibold text-lg">Upload Picture</div>
              <div className="text-sm text-gray-400 mt-1">(Only .jpg, .png)</div>
            </label>
          ) : (
            <>
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-gray-800">
                <Cropper
                  image={URL.createObjectURL(picture)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-4 w-full"
              />

              <button
                type="button"
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
                onClick={() => {
                  setPicture(null);
                  fileInputRef.current?.click();
                }}
              >
                Change Picture
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePictureChange}
          />
        </div>

        {/* Right: Song Info */}
        <div className="flex-1 flex flex-col gap-4">
          <label className="font-medium">Track Title</label>
          <input
            type="text"
            placeholder="Type your track title"
            className="p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={nameSong}
            onChange={(e) => setNameSong(e.target.value)}
          />

          <label className="font-medium">Tags</label>
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white/10 focus-within:ring-2 focus-within:ring-violet-500">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 rounded-full"
              >
                {tag}

              </Badge>
            ))}
            <input
              type="text"
              placeholder="Type and press space/enter..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 min-w-[120px]"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>

          <label className="font-medium">Description</label>
          <textarea
            rows={4}
            placeholder="Additional description"
            className="p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none flex-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              className="bg-violet-600 hover:bg-violet-700 transition px-12 text-white font-bold py-3 rounded-xl cursor-pointer duration-300"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}