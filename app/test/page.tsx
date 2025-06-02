"use client";
import Test from "@/components/Test"; // ตรวจสอบ path ให้ถูกต้อง

export default function Page() {
  const userId = 1; // หรือได้จาก session / auth

  return (
    <>
      <h1>โปรไฟล์ของ user</h1>
      <Test userId={userId} />
    </>
  );
}