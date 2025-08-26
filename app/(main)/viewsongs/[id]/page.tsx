import { prisma } from "@/lib/prisma";
import { Share2, Eye, Play } from "lucide-react";
import AddToPlaylistButton from "@/components/Plus";
import Image from "next/image";
import SongDetailControls from "@/components/SongdetailControl";
import Likebutton from "@/components/Likebutton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import FollowUserWrapper from "@/components/button/Bt";
import { generateUserSlug } from "@/lib/slug";
import Link from "next/link";
import PlaylistCover from "@/components/PlaylistCover";

export default async function SongDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const songId = Number(params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="text-white">Unauthorized</div>;
  }

  const likedRecord = await prisma.likeSong.findUnique({
    where: {
      user_id_song_id: {
        user_id: session.user.id,
        song_id: songId,
      },
    },
  });
  const songStat = await prisma.songStat.findUnique({
    where: {
      song_id: songId,
    },
    select: {
      like_count: true,
      play_count: true,
    },
  });

  const isLiked = !!likedRecord;

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { uploader: true },
  });

  if (!song) return <div>Song not found</div>;

  const followerCount = await prisma.follow.count({
    where: {
      followed_user_id: song.uploader?.id, // นับว่ามีคนติดตาม uploader คนนี้กี่คน
    },
  });

  const isFollowing = await prisma.follow.findUnique({
    where: {
      following_user_id_followed_user_id: {
        following_user_id: session.user.id,
        followed_user_id: song.uploader.id,
      },
    },
  });

  function formatCount(count?: number) {
    if (!count) return "0";

    if (count >= 1_000_000_000) {
      return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
    }
    if (count >= 1_000_000) {
      return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
    }
    if (count >= 1_000) {
      return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return count.toString();
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10 space-x-10 bg-black/60 ">
        {/* ปกเพลง */}
        <div className="relative">
          <PlaylistCover
            picture={song.picture || "/default-cover.jpg"}
            name={song.name_song}
          />
        </div>

        {/* ข้อมูลเพลง */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold">{song.name_song}</h1>
            <p className="text-gray-400 mt-1">{song.uploader?.name}</p>
          </div>
          <div className="flex justify-between mt-4 ">
            <div className="">
              <SongDetailControls song={song} />
            </div>
            <div className="text-sm px-4 py-1 rounded-full">
              <div className="flex space-x-6">
                <Likebutton songId={song.id} initialLiked={isLiked} />
                <AddToPlaylistButton
                  songId={song.id}
                  picture={song.picture ?? ""}
                />
                <Share2 className="w-9 h-9   hover:text-yellow-300 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนล่าง: ศิลปิน + คำอธิบาย + สถิติ */}
      <div className="flex flex-col md:flex-row px-10 mt-10 gap-8">
        {/* ด้านซ้าย: ศิลปิน */}
        <div className="flex flex-col items-center space-y-4 ">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 shadow-lg">
            {song.uploader && (
              <Link
                href={`/see/${generateUserSlug({
                  id: song.uploader.id,
                  username: song.uploader.name ?? "unknown",
                })}`}
              >
                <Image
                  src={song.uploader.image || "/default-avatar.png"}
                  alt={song.uploader.name || "avatar"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="112px"
                  className="cursor-pointer hover:scale-105 transition-transform duration-300"
                />
              </Link>
            )}
          </div>
          <p className="text-white font-semibold text-lg">{song.uploader?.name}</p>
          <p className="text-gray-400 text-sm">{followerCount} followers</p>
          <FollowUserWrapper
            initialIsFollowing={!!isFollowing}
            userIdToFollow={song.uploader?.id}
          />
        </div>

        {/* ด้านกลาง: คำอธิบาย */}
        <div className="flex-1 bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-white">Description</h2>
          <p className="text-gray-300 leading-relaxed">
            {song.description || "No description provided."}
          </p>
        </div>

        {/* ด้านขวา: สถิติเพลง */}
        <div className="w-36 bg-neutral-900 rounded-xl flex flex-rows  items-start gap-4 shadow-md">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              <p className="text-white font-semibold">{formatCount(songStat?.like_count)}</p>
            </div>

          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <p className="text-white font-semibold">{formatCount(songStat?.play_count)}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
