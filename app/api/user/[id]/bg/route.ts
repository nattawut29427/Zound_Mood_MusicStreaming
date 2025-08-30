import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToR2 } from "@/lib/uploadImage"; 

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id; // ตรงนี้ id จะไม่ undefined
    console.log("Updating background for user:", id);

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  
    try {

        const uploadedFileUrl = await uploadImageToR2(file);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { bg_image: uploadedFileUrl },
        });


        return NextResponse.json({
            message: "Background updated",
            url: uploadedFileUrl,
        });
    } catch (err) {
        console.error("Update bg failed:", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
