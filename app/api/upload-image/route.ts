import { NextRequest, NextResponse } from "next/server";
import { generatePresignedPutUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // สร้างชื่อไฟล์แบบ unique
    const timestamp = Date.now();
    const fileName = `pictures/${timestamp}_${file.name}`;
    
    // เรียก function generatePresignedPutUrl เพื่อให้ได้ signed URL สำหรับ upload
    const presignedUrl = await generatePresignedPutUrl(fileName, file.type);

    return NextResponse.json({ url: presignedUrl, key: fileName });
  } catch (err: any) {
    console.error("Upload image failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
