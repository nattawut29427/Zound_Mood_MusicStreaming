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

    const songsForAI = songs.map((song: any) => ({
      id: song.id,
      name: song.name_song,
      uploader: song.uploader?.name || "",
      tags: song.song_tags?.map((st: any) => st.tag?.name_tag) || [],
      description: song.description || "",
    }));

    console.log("Songs being sent to AI:", songsForAI);

    const playlistData = await generatePlaylist(prompt, songsForAI);

    return NextResponse.json(playlistData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
