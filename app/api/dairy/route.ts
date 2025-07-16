import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sections = await prisma.diary.findMany({
      include: {
        song: true,

        user: true,
      },
    });

    return NextResponse.json({ sections });
  } catch (err: any) {
    console.error("Fetch sections failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
