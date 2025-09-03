import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---------------------
// AI Playlist Generator
// ---------------------
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function generateAIPlaylist(prompt: string, songs: any[]) {
  const fullPrompt = `
คุณคือนักจัด Playlist อัจฉริยะ
คำขอของผู้ใช้: "${prompt}"
ข้อมูลเพลง:
${JSON.stringify(songs, null, 2)}
โปรดเลือกเพลงจากข้อมูลด้านบนที่เหมาะสมที่สุดกับคำขอของผู้ใช้
ตอบกลับเฉพาะ JSON ในรูปแบบนี้:
{ "playlist": [/* รหัสเพลง */], "reason": "คำอธิบายเหตุผล" }
`;
  const res = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: "คุณคือผู้ช่วยแนะนำเพลงที่เข้าใจความรู้สึกจากเพลง" },
      { role: "user", content: fullPrompt },
    ],
    temperature: 0.5,
  });
  const reply = res.choices[0].message.content;
  try {
    const jsonStart = reply.indexOf("{");
    if (jsonStart === -1) throw new Error("No JSON found");
    const jsonText = reply.slice(jsonStart);
    return JSON.parse(jsonText);
  } catch {
    return { playlist: [], reason: "" };
  }
}

// ---------------------
// Shuffle แบบ Seeded
// ---------------------
function shuffleArraySeed<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let m = arr.length, t, i;
  while (m) {
    i = Math.floor(((Math.sin(seed++) + 1) / 2) * m--);
    t = arr[m]; arr[m] = arr[i]; arr[i] = t;
  }
  return arr;
}

// ---------------------
// Filter Unique per Section
// ---------------------
function filterUniqueBySection(songs: any[], sectionSeen: Set<number>) {
  return songs.filter((s) => {
    if (sectionSeen.has(s.id)) return false;
    sectionSeen.add(s.id);
    return true;
  });
}

// ---------------------
// Feed API
// ---------------------
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const todaySeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  try {
    let sections: any[] = [];

    //  Followed
    if (session?.user?.id) {
      const followedUsers = await prisma.follow.findMany({
        where: { following_user_id: session.user.id },
        select: { followed_user_id: true },
      });
      if (followedUsers.length) {
        const followedIds = followedUsers.map(f => f.followed_user_id);
        let pool = await prisma.song.findMany({
          where: { uploaded_by: { in: followedIds } },
          include: { uploader: true, stat: true },
        });
        const sectionSeen = new Set<number>();
        pool = filterUniqueBySection(pool, sectionSeen);
        pool = shuffleArraySeed(pool, todaySeed).slice(0, 10);
        if (pool.length) sections.push({
          id: "sys-followed",
          title: "Your follow",
          description: "Songs uploaded by people you follow",
          feed_items: pool.map((s, i) => ({ id: s.id, order_index: i, song: s })),
        });
      }
    }

    //  Tags
    if (session?.user?.id) {
      const [likedSongs, historySongs] = await Promise.all([
        prisma.likeSong.findMany({
          where: { user_id: session.user.id },
          include: { song: { include: { song_tags: { include: { tag: true } }, uploader: true, stat: true } } },
          take: 20,
        }),
        prisma.listeningHistory.findMany({
          where: { user_id: session.user.id },
          include: { song: { include: { song_tags: { include: { tag: true } }, uploader: true, stat: true } } },
          take: 20,
        }),
      ]);

      const favTags = new Set<string>();
      likedSongs.forEach(s => s.song.song_tags.forEach(st => favTags.add(st.tag.name_tag)));
      historySongs.forEach(h => h.song.song_tags.forEach(st => favTags.add(st.tag.name_tag)));
      const topTags = Array.from(favTags).slice(0, 5);


      if (topTags.length) {
        let pool = await prisma.song.findMany({
          where: { song_tags: { some: { tag: { name_tag: { in: topTags } } } } },
          include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
        });
        console.log("Pool before filter:", pool.map(s => ({ id: s.id, name: s.name_song })));


        const sectionSeen = new Set<number>();
        pool = filterUniqueBySection(pool, sectionSeen);
        pool = shuffleArraySeed(pool, todaySeed).slice(0, 10);
        if (pool.length) sections.push({
          id: "sys-tags",
          title: "Based on Your Tags",
          description: "Recommended songs from your favorite tags",
          feed_items: pool.map((s, i) => ({ id: s.id, order_index: i, song: s })),

        });

        pool = filterUniqueBySection(pool, sectionSeen);
        
        console.log("Pool after filterUniqueBySection:", pool.map(s => ({ id: s.id, name: s.name_song })));


      }

      console.log("Top tags for user:", topTags);


    }


    //  Trending
    let allSongs = await prisma.song.findMany({
      include: { stat: true, uploader: true, song_tags: { include: { tag: true } } },
    });

    // ใส่ค่า default สำหรับ stat หากเป็น null
    allSongs.forEach(song => {
      if (!song.stat) {
        song.stat = { song_id: song.id, play_count: 0, like_count: 0 };
      }
    });

    // เรียงจาก view สูงสุด
    allSongs.sort((a, b) => b.stat!.play_count - a.stat!.play_count);

    // สร้าง seen ใหม่สำหรับ trending
    const seenTrending = new Set<number>();
    const trending = allSongs.filter(s => {
      if (seenTrending.has(s.id)) return false;
      seenTrending.add(s.id);
      return true;
    }).slice(0, 10);

    if (trending.length) sections.push({
      id: "sys-trending",
      title: "Trending",
      feed_items: trending.map((s, i) => ({ id: s.id, order_index: i, song: s })),
    });

    //  New Releases
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let newReleases = await prisma.song.findMany({
      where: {
        created_at: { gte: sevenDaysAgo }, //  กรองเพลงที่สร้างหลังจาก 7 วันก่อน
      },
      orderBy: { created_at: "desc" },
      include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
    });

    // สร้าง seen ใหม่สำหรับ section นี้
    const newReleasesSeen = new Set<number>();
    newReleases = filterUniqueBySection(newReleases, newReleasesSeen);

    // สุ่มลำดับ (optional)
    newReleases = shuffleArraySeed(newReleases, todaySeed).slice(0, 10);

    if (newReleases.length) sections.push({
      id: "sys-new",
      title: "New Releases",
      feed_items: newReleases.map((s, i) => ({ id: s.id, order_index: i, song: s })),
    });

    // Recommended (history-based)
    if (session?.user?.id) {
      const history = await prisma.listeningHistory.findMany({
        where: { user_id: session.user.id },
        orderBy: { listened_at: "desc" },
        take: 20,
        include: { song: { include: { song_tags: { include: { tag: true } }, uploader: true, stat: true } } },
      });

      const favTags = history.flatMap(h => h.song.song_tags.map(st => st.tag.name_tag)).slice(0, 5);
      if (favTags.length) {
        let pool = await prisma.song.findMany({
          where: { song_tags: { some: { tag: { name_tag: { in: favTags } } } }, listeningHistories: { none: { user_id: session.user.id } } },
          include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
        });
        const recommendedSeen = new Set<number>();
        pool = filterUniqueBySection(pool, recommendedSeen);
        pool = shuffleArraySeed(pool, todaySeed).slice(0, 10);
        if (pool.length) sections.push({
          id: "sys-recommended",
          title: "Recommended For You",
          feed_items: pool.map((s, i) => ({ id: s.id, order_index: i, song: s })),
        });
      }
    }

//     //  AI Picks
//     if (session?.user?.id) {
//       const history = await prisma.listeningHistory.findMany({
//         where: { user_id: session.user.id },
//         orderBy: { listened_at: "desc" },
//         take: 20,
//         include: { song: { include: { song_tags: { include: { tag: true } }, uploader: true, stat: true } } },
//       });

//       const favTags = [...new Set(history.flatMap(h => h.song.song_tags.map(st => st.tag.name_tag)))];

//       if (favTags.length) {
//         const pool = await prisma.song.findMany({
//           where: { song_tags: { some: { tag: { name_tag: { in: favTags } } } } },
//           include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
//         });

//         const autoPrompt = `Generate a personalized feed for user ${session.user.id} based on their listening history and favorite tags. 
// Select songs that are similar in style or mood to the songs they've recently listened to.`;

//         const aiResult = await generateAIPlaylist(autoPrompt, pool);

//         const aiSongs = pool.filter((s) => aiResult.playlist.map(String).includes(String(s.id)));
//         if (aiSongs.length) {
//           sections.push({
//             id: "sys-ai",
//             title: "🤖 AI Picks",
//             description: aiResult.reason,
//             feed_items: aiSongs.map((s, i) => ({ id: s.id, order_index: i, song: s })),
//           });
//         }
//       }
//     }

    //  DB Sections
    const dbSections = await prisma.feedSection.findMany({
      include: { feed_items: { include: { song: { include: { uploader: true, stat: true } } } } },
    });
    const dbSectionsFiltered = dbSections.map(sec => {
      const sectionSeen = new Set<number>();
      return {
        ...sec,
        feed_items: filterUniqueBySection(sec.feed_items.map(fi => fi.song), sectionSeen)
          .map((s, i) => ({ id: s.id, order_index: i, song: s })),
      };
    });
    sections = [...sections, ...dbSectionsFiltered];

    return NextResponse.json({ sections });

  } catch (err) {
    console.error("Fetch sections failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
