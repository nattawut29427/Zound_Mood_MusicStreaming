"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2, Play } from "lucide-react";
import PlaylistCover from "@/components/PlaylistCover";
import Likebutton from "@/components/Likebutton";
import AddToPlaylistButton from "@/components/Plus";
import EditSongButton from "@/components/button/Editsg";
import FollowUserWrapper from "@/components/button/Bt";
import SongDetailControls from "@/components/SongdetailControl";
import { generateUserSlug } from "@/lib/slug";
import { useSignedImage } from "@/lib/hooks/useSignedImage";


type Props = {
  song: any;
  isLiked: boolean;
  playCount: number;
  likeCount: number;
  followerCount: number;
  isFollowing: boolean;
  sessionUserId: string;
};

export default function SongDetailClient({
  song,
  isLiked,
  playCount,
  likeCount,
  followerCount,
  isFollowing,
  sessionUserId,
}: Props) {
  const uploaderImage = useSignedImage(song.uploader?.image || "");


  function formatCount(count: number): string {
    if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(1) + "b";
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "m";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "k";
    return count.toString();
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10 space-x-10 bg-black/60">
        <div className="relative">
          <PlaylistCover picture={song.picture} name={song.name_song} />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold">{song.name_song}</h1>
            <p className="text-gray-400 mt-1">{song.uploader?.name}</p>
          </div>
          <div className="flex justify-between mt-4">
            <div>
              <SongDetailControls song={song} />
            </div>
            <div className="flex space-x-6 items-center">
              {song.uploader?.id === sessionUserId ? (
                <EditSongButton
                  song={{
                    ...song,
                    picture: song.picture ?? undefined,
                    song_tags: song.song_tags.map((tag: any) => ({
                      name_tag: tag.name_tag ?? "",
                    })),
                  }}
                />
              ) : (
                <>
                  <Likebutton songId={song.id} initialLiked={isLiked} />
                  <AddToPlaylistButton songId={song.id} picture={song.picture ?? ""} />
                  <Share2 className="w-9 h-9 hover:text-yellow-300 cursor-pointer" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนล่าง: ศิลปิน + คำอธิบาย + สถิติ */}
      <div className="flex flex-col md:flex-row px-10 mt-10 mb-20 gap-8">
        {/* ศิลปิน */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 shadow-lg">
            {song.uploader && (
              <Link
                href={`/see/${generateUserSlug({
                  id: song.uploader.id,
                  username: song.uploader.name ?? "unknown",
                })}`}
              >
                <Image
                  src={uploaderImage || "/default-avatar.png"}
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
          <FollowUserWrapper initialIsFollowing={isFollowing} userIdToFollow={song.uploader?.id} />
        </div>

        {/* คำอธิบาย */}
        <div className="flex-1 bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-4 text-white">Description</h2>
          <section className="text-gray-300 leading-relaxed whitespace-pre-line">
            {song.description || "No description provided."}
          </section>
        </div>

        {/* สถิติ */}
        <div className="w-36 bg-neutral-900 rounded-xl flex flex-row gap-4 items-start">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-neutral-600" />
            <p className="text-white font-semibold">{formatCount(playCount)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-neutral-600" />
            <p className="text-white font-semibold">{formatCount(likeCount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
