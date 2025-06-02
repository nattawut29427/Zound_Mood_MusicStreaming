"use client";

import { useEffect, useState } from "react";

type Props = {
  userId: number;
};

export default function ProfileImage({ userId }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null);

useEffect(() => {
  const fetchProfileAndImage = async () => {
    try {
      // ดึง profileKey จาก API
      const resUser = await fetch(`/api/user/${userId}`);
      if (!resUser.ok) {
        console.error("ไม่พบ user");
        return;
      }
      const { profileKey, username } = await resUser.json();
      setUsername(username);

      if (!profileKey) {
        console.error("user ไม่มี profileKey");
        return;
      }

      // signed URL จาก key ที่ได้
      const resUrl = await fetch(`/api/view-image?key=${encodeURIComponent(profileKey)}`);
      if (!resUrl.ok) {
        console.error("ไม่สามารถดึง signed URL ได้");
        return;
      }
      const dataUrl = await resUrl.json();
      if (dataUrl.url) {
        setImageUrl(dataUrl.url);
      } else {
        console.error("ไม่สามารถสร้าง signed url ได้", dataUrl.error);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
  };

  fetchProfileAndImage();
}, [userId]);


  if (!imageUrl) return <p>กำลังโหลดรูป...</p>;

  return (
    <>
    <img
      src={imageUrl}
      alt="โปรไฟล์ผู้ใช้"
      className="w-40 h-40 rounded-full object-cover border"
    />
    <div>{username}</div>
      </>
  );
}
