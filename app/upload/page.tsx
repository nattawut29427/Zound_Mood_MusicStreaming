  "use client";
  import { useState } from "react";

  export default function UploadSong() {
    const [file, setFile] = useState<File | null>(null);
    const [nameSong, setNameSong] = useState("");
    const [message, setMessage] = useState("");
    const [picture, setPicture] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
      }
    };

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
    const songUrlRes = await fetch(`/api/upload?key=${encodeURIComponent(songKey)}&contentType=${encodeURIComponent(file.type)}`);
    if (!songUrlRes.ok) throw new Error("ขอ signed URL สำหรับเพลงล้มเหลว");
    const { url: songUploadUrl } = await songUrlRes.json();

    const songUploadRes = await fetch(songUploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!songUploadRes.ok) throw new Error("อัปโหลดเพลงล้มเหลว");

    // สำหรับอัปโหลดรูปภาพ
    const picUrlRes = await fetch(`/api/upload?key=${encodeURIComponent(picKey)}&contentType=${encodeURIComponent(picture.type)}`);
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
        uploaded_by: 1, // สมมุติว่า userId คือ 1
      }),
    });

    const saveData = await saveRes.json();

    if (!saveRes.ok) {
      setMessage("บันทึกข้อมูลเพลงล้มเหลว: " + (saveData.error || ""));
      return;
    }

    setMessage("อัปโหลดเพลงและรูปภาพสำเร็จ!");
    setFile(null);
    setPicture(null);
    setNameSong("");

  } catch (error: any) {
    setMessage("เกิดข้อผิดพลาด: " + error.message);
  }
};

 return (
  <div className=" h-screen flex ">

  <div className="max-w-md mx-auto h-fit mt-10 p-6 bg-white  rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4 text-center">อัปโหลดเพลงใหม่</h2>

    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">ชื่อเพลง</label>
      <input
        type="text"
        placeholder="ชื่อเพลง"
        value={nameSong}
        onChange={(e) => setNameSong(e.target.value)}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">ไฟล์เพลง (.mp3)</label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="w-full"
      />
    </div>

    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">รูปภาพปกเพลง</label>
      <input
        type="file"
        accept="image/*"
        onChange={handlePictureChange}
        className="w-full"
        />
    </div>

    <button
      onClick={handleUpload}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
      อัพโหลดเพลงและรูปภาพ
    </button>

    {message && (
      <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
    )}
  </div>
    </div>
);
  }

