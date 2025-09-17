import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const diaryId = parseInt(params.id);

    if (isNaN(diaryId)) {
      return NextResponse.json(
        { error: "Invalid diary id" },
        { status: 400 }
      );
    }

    await prisma.diary.delete({
      where: { id: diaryId },
    });

    return NextResponse.json({ message: "Diary deleted successfully" });
  } catch (error) {
    console.error("Error deleting diary:", error);
    return NextResponse.json(
      { error: "Failed to delete diary" },
      { status: 500 }
    );
  }
}
