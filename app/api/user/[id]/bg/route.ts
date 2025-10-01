import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToR2 } from "@/lib/uploadImage"; 
import { getSignedUrl } from "@/lib/getSignedurl";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { bg_image: true },
  });

  if (!user?.bg_image) return NextResponse.json({ bg_image: null });

  const url = await getSignedUrl(user.bg_image);
  return NextResponse.json({ bg_image: url });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log("Updating background for user:", id);

  // ตรวจสอบ session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ดึงไฟล์จาก formData
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    // อัปโหลดไฟล์ไปยัง R2
    const uploadedFileUrl = await uploadImageToR2(file);

    // เช็คก่อนว่า user มีอยู่จริงไหม
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // อัปเดต bg_image ของ user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { bg_image: uploadedFileUrl },
      select: { id: true, bg_image: true },
    });

    return NextResponse.json({
      message: "Background updated",
      url: updatedUser.bg_image,
    });
  } catch (err: any) {
    console.error("❌ Update bg failed:", err);
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}