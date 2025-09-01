import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import SongDetailClient from "@/components/SongDetail/SongDetailClient";

export default async function SongDetailPage({ params }: { params: { id: string } }) {
  const songId = Number(params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="text-white">Unauthorized</div>;
  }

  //  ดึงข้อมูล song + uploader ในครั้งเดียว
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { uploader: true, song_tags: true },
  });

  if (!song) return <div className="text-white">Song not found</div>;



  const uploaderId = song.uploader.id

  //  ใช้ uploaderId ที่ได้จาก song ไป query ต่อ
  const [likedRecord, songStat, likeCount, followerCount, isFollowing] = await Promise.all([
    prisma.likeSong.findUnique({
      where: { user_id_song_id: { user_id: session.user.id, song_id: songId } },
    }),
    prisma.songStat.findUnique({
      where: { song_id: songId },
      select: { play_count: true },
    }),
    prisma.likeSong.count({ where: { song_id: songId } }),
    prisma.follow.count({
      where: { followed_user_id: uploaderId },
    }),
    prisma.follow.findUnique({
      where: {
        following_user_id_followed_user_id: {
          following_user_id: session.user.id,
          followed_user_id: uploaderId,
        },
      },
    }),
  ]);

  return (
    <SongDetailClient
      song={song}
      isLiked={!!likedRecord}
      playCount={songStat?.play_count ?? 0}
      likeCount={likeCount}
      followerCount={followerCount}
      isFollowing={!!isFollowing}
      sessionUserId={session.user.id}
    />
  );
}
