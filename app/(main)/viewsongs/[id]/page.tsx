import { prisma } from "@/lib/prisma";
import SongCover from "@/components/Songcover";
import { Share2 } from "lucide-react";
import AddToPlaylistButton from "@/components/Plus";
import Image from "next/image";
import SongDetailControls from "@/components/SongdetailControl";
import Likebutton from "@/components/Likebutton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import FollowUserWrapper from "@/components/button/Bt";
import { generateUserSlug } from "@/lib/slug";
import Link from "next/link";

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

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10 space-x-10 bg-black/60 ">
        {/* ปกเพลง */}
        <div className="relative">
          <SongCover
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

      {/* ส่วนล่าง: ศิลปิน + คำอธิบาย */}
      <div className="flex px-10 mt-10 space-x-10">
        {/* ด้านซ้าย: ศิลปิน */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-600">
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
                  sizes="96px"
                  className="cursor-pointer hover:opacity-80 transition-opacity duration-300"
                />
              </Link>
            )}
          </div>
          <p className="text-gray-300">{song.uploader?.name}</p>
          <p>{followerCount} followers</p>
          <FollowUserWrapper
            initialIsFollowing={!!isFollowing}
            userIdToFollow={song.uploader?.id}
          />
        </div>

        {/* ด้านขวา: คำอธิบาย */}
        <div className="flex-1 bg-neutral-800 p-6 rounded-md">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          {/* <p>{song.description || "No description provided."}</p> */}
        </div>
        <div className="w-64 bg-black ">
          <p>{songStat?.like_count}</p>
          <p>{songStat?.play_count}</p>
        </div>
      </div>
    </div>
  );
}
