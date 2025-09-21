import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---------------------
// AI Playlist Generator (ยังคงไว้ ถ้าอยากเปิดใช้)
// ---------------------
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ---------------------
// Utils
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

function filterUnique<T extends { id: number }>(songs: T[], seen: Set<number>) {
  return songs.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

// ---------------------
// Feed API
// ---------------------
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const todaySeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  try {
    const sections: any[] = [];
    const userId = session?.user?.id;

    // run queries in parallel
    const [
      followedUsers,
      likedSongs,
      historySongs,
      allSongs,
      newReleases,
      dbSections,
    ] = await Promise.all([
      userId
        ? prisma.follow.findMany({
          where: { following_user_id: userId },
          select: { followed_user_id: true },
        })
        : Promise.resolve([]),

      userId
        ? prisma.likeSong.findMany({
          where: { user_id: userId },
          include: {
            song: {
              include: {
                song_tags: { include: { tag: true } },
                uploader: true,
                stat: true,
              },
            },
          },
          take: 50,
        })
        : Promise.resolve([]),

      userId
        ? prisma.listeningHistory.findMany({
          where: { user_id: userId },
          include: {
            song: {
              include: {
                song_tags: { include: { tag: true } },
                uploader: true,
                stat: true,
              },
            },
          },
          take: 50,
        })
        : Promise.resolve([]),

      prisma.song.findMany({
        include: { stat: true, uploader: true, song_tags: { include: { tag: true } } },
        take: 200, // limit เพื่อไม่โหลดทั้ง DB
      }),

      prisma.song.findMany({
        where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { created_at: "desc" },
        include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
        take: 50,
      }),

      prisma.feedSection.findMany({
        include: { feed_items: { include: { song: { include: { uploader: true, stat: true } } } } },
      }),
    ]);

    // ====================
    // Section: Followed
    // ====================
    if (userId && followedUsers.length) {
      const followedIds = followedUsers.map((f) => f.followed_user_id);
      let pool = await prisma.song.findMany({
        where: { uploaded_by: { in: followedIds } },
        include: { uploader: true, stat: true },
        take: 30,
      });
      const seen = new Set<number>();
      pool = filterUnique(pool, seen);
      pool = shuffleArraySeed(pool, todaySeed).slice(0, 10);
      if (pool.length) {
        sections.push({
          id: "sys-followed",
          title: "Your follow",
          description: "Songs uploaded by people you follow",
          feed_items: pool.map((s, i) => ({ id: s.id, order_index: i, song: s })),
        });
      }
    }

    // ====================
    // Section: Tags
    // ====================
    if (userId && (likedSongs.length || historySongs.length)) {
      const favTags = new Set<string>();
      likedSongs.forEach((s) => s.song.song_tags.forEach((st) => favTags.add(st.tag.name_tag)));
      historySongs.forEach((h) => h.song.song_tags.forEach((st) => favTags.add(st.tag.name_tag)));
      const topTags = Array.from(favTags).slice(0, 5);

      if (topTags.length) {
        let pool = await prisma.song.findMany({
          where: { song_tags: { some: { tag: { name_tag: { in: topTags } } } } },
          include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
          take: 50,
        });

        const seen = new Set<number>();
        pool = filterUnique(pool, seen);
        pool = shuffleArraySeed(pool, todaySeed).slice(0, 10);
        if (pool.length) {
          sections.push({
            id: "sys-tags",
            title: "Based on Your Tags",
            description: "Recommended songs from your favorite tags",
            feed_items: pool.map((s, i) => ({ id: s.id, order_index: i, song: s })),
          });
        }
      }
    }

    // ====================
    // Section: Trending
    // ====================
    allSongs.forEach((s) => {
      if (!s.stat) s.stat = { song_id: s.id, play_count: 0, like_count: 0 };
    });
    const trending = [...allSongs]
      .sort((a, b) => (b.stat?.play_count || 0) - (a.stat?.play_count || 0))
      .slice(0, 10);

    if (trending.length) {
      sections.push({
        id: "sys-trending",
        title: "Trending",
        feed_items: trending.map((s, i) => ({ id: s.id, order_index: i, song: s })),
      });
    }


    // ====================
    // Section: New User Default Feed
    // ====================
    if (!userId || (!likedSongs.length && !historySongs.length && !followedUsers.length)) {

      // หา top tags ทั้งหมดใน DB
      const topTags = await prisma.tag.findMany({
        orderBy: { song_tags: { _count: "desc" } },
        take: 10,
      });

      // สุ่ม 2-3 tags
      const numTags = 3;
      const pickedTags: typeof topTags = [];
      for (let i = 0; i < numTags; i++) {
        const tag = topTags[(todaySeed + i) % topTags.length];
        if (tag) pickedTags.push(tag);
      }

      const genreSongs: any[] = [];
      const songsPerTag = Math.ceil(10 / pickedTags.length); // แบ่งเพลงให้ครบ 10

      for (const tag of pickedTags) {
        const songs = await prisma.song.findMany({
          where: { song_tags: { some: { tag_id: tag.id } } },
          include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
          take: songsPerTag,
        });
        genreSongs.push(...songs);
      }

      // shuffle และ slice 10 เพลง
      const finalSongs = shuffleArraySeed(genreSongs, todaySeed).slice(0, 10);

      if (finalSongs.length) {
        sections.push({
          id: "sys-genre-explore",
          title: `Explore ${pickedTags.map(t => t.name_tag).join(", ")}`,
          description: `Discover songs from popular tags`,
          feed_items: finalSongs.map((s, i) => ({ id: s.id, order_index: i, song: s })),
        });
      }
    }



    // ====================
    // Section: Recommended
    // ====================
    if (userId && (likedSongs.length || historySongs.length)) {
      const tagFreq: Record<string, number> = {};
      [...likedSongs, ...historySongs].forEach((s) =>
        s.song.song_tags.forEach(
          (st) => (tagFreq[st.tag.name_tag] = (tagFreq[st.tag.name_tag] || 0) + 1)
        )
      );

      const topTags = Object.entries(tagFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);

      if (topTags.length) {
        let pool = await prisma.song.findMany({
          where: {
            song_tags: { some: { tag: { name_tag: { in: topTags } } } },
            listeningHistories: { none: { user_id: userId } },
          },
          include: { uploader: true, stat: true, song_tags: { include: { tag: true } } },
          take: 50,
        });

        const scoredPool = pool.map((song) => ({
          song,
          score: song.song_tags.reduce((acc, st) => acc + (tagFreq[st.tag.name_tag] || 0), 0),
        }));

        scoredPool.sort((a, b) => b.score - a.score);
        const recommendedSongs = shuffleArraySeed(
          scoredPool.slice(0, 10).map((p) => p.song),
          todaySeed
        );

        if (recommendedSongs.length) {
          sections.push({
            id: "sys-recommended",
            title: "Recommended For You",
            feed_items: recommendedSongs.map((s, i) => ({ id: s.id, order_index: i, song: s })),
          });
        }
      }
    }

    // ====================
    // Section: New Releases
    // ====================
    let newReleaseList = filterUnique(newReleases, new Set<number>());
    newReleaseList = shuffleArraySeed(newReleaseList, todaySeed).slice(0, 10);
    if (newReleaseList.length) {
      sections.push({
        id: "sys-new",
        title: "New Releases",
        feed_items: newReleaseList.map((s, i) => ({ id: s.id, order_index: i, song: s })),
      });
    }



    // ====================
    // Section: DB Custom Sections
    // ====================
    const dbSectionsFiltered = dbSections.map((sec) => {
      const seen = new Set<number>();
      return {
        ...sec,
        feed_items: filterUnique(sec.feed_items.map((fi) => fi.song), seen).map((s, i) => ({
          id: s.id,
          order_index: i,
          song: s,
        })),
      };
    });

    return NextResponse.json({ sections: [...sections, ...dbSectionsFiltered] });
  } catch (err) {
    console.error("Fetch sections failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
