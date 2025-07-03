import { NextResponse } from "next/server";
import { generatePlaylist } from "@/lib/Groq";

export async function POST(req: Request) {
  try {
    const { prompt, songs } = await req.json();

    if (!prompt || !Array.isArray(songs)) {
      return NextResponse.json(
        { error: "Invalid request, missing prompt or songs" },
        { status: 400 }
      );
    }

    const playlistData = await generatePlaylist(prompt, songs);

    return NextResponse.json(playlistData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
