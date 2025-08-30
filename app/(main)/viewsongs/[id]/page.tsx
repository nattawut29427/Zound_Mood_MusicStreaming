import { prisma } from "@/lib/prisma";
import { Share2, Eye, Play, Pencil } from "lucide-react";
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
import EditSongButton from "@/components/button/Editsg";

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

  // ✅ เช็คว่า user กด like เพลงนี้แล้วหรือยัง
  const likedRecord = await prisma.likeSong.findUnique({
    where: {
      user_id_song_id: {
        user_id: session.user.id,
        song_id: songId,
      },
    },
  });
  const isLiked = !!likedRecord;

  // ✅ ดึง play_count จาก SongStat
  const songStat = await prisma.songStat.findUnique({
    where: {
      song_id: songId,
    },
    select: {
      play_count: true,
    },
  });

  // ✅ นับจำนวน like ของเพลงนี้
  const likeCount = await prisma.likeSong.count({
    where: {
      song_id: songId,
    },
  });

  // ✅ ดึงข้อมูลเพลง
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: {
      uploader: true,
      song_tags: true,
    },
  });

  if (!song) return <div>Song not found</div>;

  // ✅ จำนวน followers ของ uploader
  const followerCount = await prisma.follow.count({
    where: {
      followed_user_id: song.uploader?.id,
    },
  });

  // ✅ เช็คว่ากำลัง follow uploader อยู่หรือไม่
  const isFollowing = await prisma.follow.findUnique({
    where: {
      following_user_id_followed_user_id: {
        following_user_id: session.user.id,
        followed_user_id: song.uploader.id,
      },
    },
  });

  function formatCount(count?: number): string {
    if (!count || count <= 0) return "0";

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
    <div className="bg-neutral-900 min-h-screen text-white ">
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
            <div>
              <SongDetailControls song={song} />
            </div>
            <div className="text-sm px-4 py-1 rounded-full">
              <div className="flex space-x-6 items-center">
                {song.uploader?.id === session.user.id ? (
                  // ถ้าเป็นเพลงตัวเอง แสดงเฉพาะ Edit
                  <EditSongButton
                    song={{
                      ...song,
                      song_tags: song.song_tags.map((tag: any) => ({
                        name_tag: tag.name_tag ?? "",
                      })),
                    }}
                  />
                ) : (
                  // ถ้าไม่ใช่เพลงตัวเอง แสดงปุ่มปกติ
                  <>
                    <Likebutton songId={song.id} initialLiked={isLiked} />
                    <AddToPlaylistButton
                      songId={song.id}
                      picture={song.picture ?? ""}
                    />
                    <Share2 className="w-9 h-9 hover:text-yellow-300 cursor-pointer" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนล่าง: ศิลปิน + คำอธิบาย + สถิติ */}
      <div className="flex flex-col md:flex-row px-10 mt-10 mb-20 gap-8">
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
          <p className="text-white font-semibold text-lg">
            {song.uploader?.name}
          </p>
          <p className="text-gray-400 text-sm">{followerCount} followers</p>
          <FollowUserWrapper
            initialIsFollowing={!!isFollowing}
            userIdToFollow={song.uploader?.id}
          />
        </div>

        {/* ด้านกลาง: คำอธิบาย */}
        <div className="flex-1 bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-white">Description</h2>
          <section className="text-gray-300 leading-relaxed whitespace-pre-line">
            {song.description || "No description provided."}
          </section>
        </div>

        {/* ด้านขวา: สถิติเพลง */}
        <div className="w-36 bg-neutral-900 rounded-xl flex flex-row gap-4 items-start">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-neutral-600" />
            <p className="text-white font-semibold">
              {formatCount(songStat?.play_count ?? 0)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-neutral-600" />
            <p className="text-white font-semibold">
              {formatCount(likeCount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
