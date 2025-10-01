// export async function uploadImageToR2(file: File): Promise<string> {
//   try {
//     // ป้องกันชื่อไฟล์ซ้ำหรือมีอักขระแปลก ๆ
//     const extension = file.name.split('.').pop();
//     const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
//     const pictureKey = `pictures/${safeName}`;

//     // ขอ signed PUT URL จาก API /api/upload
//     const signedUrlRes = await fetch(
//       `/api/upload?key=${encodeURIComponent(pictureKey)}&contentType=${encodeURIComponent(file.type)}`
//     );

//     if (!signedUrlRes.ok) {
//       throw new Error("ขอ signed URL ไม่สำเร็จ");
//     }

//     const { url: uploadUrl } = await signedUrlRes.json();

//     //  ส่งไฟล์เข้า R2
//     const uploadRes = await fetch(uploadUrl, {
//       method: "PUT",
//       headers: { "Content-Type": file.type },
//       body: file,
//     });

//     if (!uploadRes.ok) {
//       const errorText = await uploadRes.text();
//       console.error("❌ Failed PUT:", errorText);
//       throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");
//     }

//     return pictureKey;
//   } catch (err: any) {
//     console.error("❌ Upload Error:", err);
//     throw new Error(err.message || "อัปโหลดรูปภาพล้มเหลว");
//   }
// }

export async function uploadImageToR2(file: File): Promise<string> {
  try {
    const extension = file.name.split('.').pop();
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const pictureKey = `pictures/${safeName}`;

    //  ใช้ absolute URL สำหรับ server-side
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const signedUrlRes = await fetch(
      `/api/service/upload?key=${encodeURIComponent(pictureKey)}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!signedUrlRes.ok) {
      throw new Error("ขอ signed URL ไม่สำเร็จ");
    }

    const { url: uploadUrl } = await signedUrlRes.json();

    // ส่งไฟล์ไปยัง R2
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("❌ Failed PUT:", errorText);
      throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");
    }

    return pictureKey; // หรือ return uploadUrl ถ้าต้องการ URL จริง
  } catch (err: any) {
    console.error("❌ Upload Error:", err);
    throw new Error(err.message || "อัปโหลดรูปภาพล้มเหลว");
  }
}
