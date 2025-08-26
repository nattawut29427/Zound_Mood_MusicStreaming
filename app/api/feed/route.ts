import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    let followedFeed: any[] = [];
    let recommendedFeed: any[] = [];

    // -------------------------------
    // 🎧 เพลงจากคนที่เราติดตาม
    // -------------------------------
    if (session?.user?.id) {
      const followedUsers = await prisma.follow.findMany({
        where: { following_user_id: session.user.id },
        select: { followed_user_id: true },
      });

      const followedIds = followedUsers.map((f) => f.followed_user_id);

      const followedSongs = await prisma.song.findMany({
        where: { uploaded_by: { in: followedIds } },
        include: { uploader: true },
        orderBy: { created_at: "desc" },
        take: 10,
      });

      if (followedSongs.length > 0) {
        followedFeed = [
          {
            id: "followed-feed",
            title: "Your follow",
            description: "Songs uploaded by people you follow",
            feed_items: followedSongs.map((song) => ({
              id: song.id,
              order_index: 0,
              song: song,
            })),
          },
        ];
      }
    }

    let tagSongs: any[] = [];
    if (session?.user) {
      // เอาเพลงที่ user เคยฟังหรือ like
      const likedSongs = await prisma.likeSong.findMany({
        where: { user_id: session.user.id },
        include: {
          song: { include: { song_tags: { include: { tag: true } } } },
        },
        take: 20,
      });

      const historySongs = await prisma.listeningHistory.findMany({
        where: { user_id: session.user.id },
        include: {
          song: { include: { song_tags: { include: { tag: true } } } },
        },
        take: 20,
      });

      // tag ที่โผล่บ่อยสุด
      const favTags = [
        ...likedSongs.flatMap((s) => s.song.song_tags.map((st) => st.tag.name_tag)),
        ...historySongs.flatMap((h) => h.song.song_tags.map((st) => st.tag.name_tag)),
      ];

      const topTags = [...new Set(favTags)].slice(0, 5); // เอามาสัก 5 tag

      if (topTags.length > 0) {
        tagSongs = await prisma.song.findMany({
          where: {
            song_tags: { some: { tag: { name_tag: { in: topTags } } } },
          },
          include: {
            uploader: true,
            song_tags: { include: { tag: true } },
          },
          take: 10,
          orderBy: { created_at: "desc" },
        });
      }
    }

    //  เพิ่มเข้า feed
    const tagFeed = tagSongs.length
      ? [
        {
          id: -2,
          title: "🎧 Songs Based on Your Tags",
          description: "Recommended songs from your favorite tags",
          feed_items: tagSongs.map((song) => ({
            id: song.id,
            order_index: 0,
            song,
          })),
        },
      ]
      : [];

    // -------------------------------
    // 🔥 Trending (top by play_count)
    // -------------------------------
    const trending = await prisma.song.findMany({
      orderBy: { stat: { play_count: "desc" } },
      take: 10,
      include: { stat: true, song_tags: { include: { tag: true } }, uploader: true },
    });

    // -------------------------------
    // 🆕 New Releases
    // -------------------------------
    const newReleases = await prisma.song.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: { stat: true, song_tags: { include: { tag: true } }, uploader: true },
    });

    // -------------------------------
    // 🎯 Recommended (based on listening history)
    // -------------------------------
    let recommended: any[] = [];
    if (session?.user) {
      const history = await prisma.listeningHistory.findMany({
        where: { user_id: session.user.id },
        orderBy: { listened_at: "desc" },
        take: 20,
        include: {
          song: { include: { song_tags: { include: { tag: true } } } },
        },
      });

      const favTags = history
        .flatMap((h) => h.song.song_tags.map((st) => st.tag.name_tag))
        .slice(0, 5);

      if (favTags.length > 0) {
        recommended = await prisma.song.findMany({
          where: {
            song_tags: { some: { tag: { name_tag: { in: favTags } } } },
            listeningHistories: {
              none: { user_id: session.user.id },
            },
          },
          take: 10,
          include: { stat: true, song_tags: { include: { tag: true } }, uploader: true },
        });
      }
    }

    recommendedFeed = [
      {
        id: "trending-feed",
        title: "🔥 Trending",
        feed_items: trending.map((s, i) => ({ id: s.id, order_index: i, song: s }))
      },
      {
        id: "new-feed",
        title: "🆕 New Releases",
        feed_items: newReleases.map((s, i) => ({ id: s.id, order_index: i, song: s }))
      },
      {
        id: "recommended-feed",
        title: "🎯 Recommended For You",
        feed_items: recommended.map((s, i) => ({ id: s.id, order_index: i, song: s }))
      },
      {
        id: "tag-feed",
        title: "🏷️ Based on Your Tags",
        feed_items: tagSongs.map((s, i) => ({ id: s.id, order_index: i, song: s }))
      },
    ];
    // -------------------------------
    // 📂 Feed sections จาก DB
    // -------------------------------
    const sections = await prisma.feedSection.findMany({
      include: {
        feed_items: {
          include: {
            song: {
              include: { uploader: true },
            },
          },
        },
      },
    });

    // รวมทั้งหมด
    const allSections = [...followedFeed, ...recommendedFeed, ...sections];

    return NextResponse.json({ sections: allSections });
  } catch (err: any) {
    console.error("Fetch sections failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
