// lib/uploadImage.ts

export async function uploadImageToR2(file: File): Promise<string> {
  try {
    const pictureKey = `cover/${Date.now()}_${file.name}`;

    const signedUrlRes = await fetch(
      `/api/upload?key=${encodeURIComponent(pictureKey)}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!signedUrlRes.ok) {
      throw new Error("ขอ signed URL ไม่สำเร็จ");
    }

    const { url: uploadUrl } = await signedUrlRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");
    }

    return pictureKey;
  } catch (err: any) {
    console.error("❌ Upload Error:", err);
    throw new Error(err.message || "อัปโหลดรูปภาพล้มเหลว");
  }
}
