// app/api/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedPutUrl } from "@/lib/r2";
import { prisma } from "@/lib/prisma"; // ตรวจสอบ path ของ prisma ให้ถูกต้อง


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const contentType = searchParams.get("contentType");

  if (!key || !contentType) {
    return NextResponse.json({ error: "Missing key or contentType" }, { status: 400 });
  }

  const url = await generatePresignedPutUrl(key, contentType);

  return NextResponse.json({ url });
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, profileKey } = await req.json();
    const id = Number(userId);

    if (!id || !profileKey) {
      return NextResponse.json({ error: "Missing userId or profileKey" }, { status: 400 });
    }

    console.log("PATCH update profile", { id, profileKey });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { profile: profileKey },
    });

    console.log("User updated:", updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("Update profile failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
