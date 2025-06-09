  import { NextRequest, NextResponse } from "next/server";
  import { prisma } from "@/lib/prisma";

  export async function GET(req: NextRequest) {
    try {
    const sections = await prisma.feedSection.findMany({
    include: {
      feed_items: {
        include: {
          song: {
            include: {
              uploader: true,
            },
          },
        },
      },
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
