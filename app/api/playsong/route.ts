
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedGetUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key"); 


  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const url = await generatePresignedGetUrl(key);
 
  return NextResponse.json({ url });
}
