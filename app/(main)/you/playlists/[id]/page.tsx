import { prisma } from "@/lib/prisma";
import PlaylistsCover from "@/components/PlaylistCover";
import { Heart, Share2, Pencil, MinusCircle } from "lucide-react";
import AddToPlaylistButton from "@/components/Plus";
import Smallpic from "@/components/cover_pic/Smallpic";
import PlaylistDetailControls from "@/components/PlaylistsControl";
import { Song } from "@/components/types";
import Delpl from "@/components/button/Delpl";
import Delmpl from "@/components/button/Delmpl";
import Duration from "@/components/button/Duration";
import SongRow from "@/components/Plsong/page";

export default async function PlaylistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: Number(params.id) },
    include: {
      playlist_songs: {
        include: {
          song: {
            include: {
              uploader: true, //ดึงชื่อผู้ใช้ของเพลง
            },
          },
        },
      },
      user: true, // เจ้าของ Playlist
    },
  });

  if (!playlist) {
    return <div className="text-white">ไม่พบ Playlist</div>;
  }

  // ดึง array ของ Song objects ออกมาจาก playlist_songs
  const songsInPlaylist = playlist.playlist_songs.map((ps) => ps.song);

  return (
    <div className="bg-neutral-900 max-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10  space-x-10 bg-black/60">
        {/* ปกเพลง */}
        <div className="relative">
          <PlaylistsCover
            picture={playlist.pic_playlists ?? ""}
            name={playlist.name_playlist}
          />
        </div>

        {/* ข้อมูลเพลง */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold">{playlist.name_playlist}</h1>
            <p className="text-gray-400 mt-1">{playlist.user.name}</p>
          </div>
          <div className="flex justify-between mt-4 ">
            <div className="">
              <PlaylistDetailControls
                playlistId={playlist.id}
                playlistName={playlist.name_playlist}
                playlistPicture={playlist.pic_playlists ?? ""}
                creatorName={playlist.user?.name ?? "Unknown Creator"}
                songs={songsInPlaylist}
              />
            </div>
            <div className="text-sm px-4 py-1 rounded-full">
              <div className="flex text-center mt-6 ">

                <Delmpl
                  playlistId={playlist.id}
                  playlistName={playlist.name_playlist}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Songs List Section */}
      <div className="px-8 lg:px-10  pb-8">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-400 border-b border-neutral-700/50 mb-4">
          <div className="col-span-1 text-center">No.</div>
          <div className="col-span-6 lg:col-span-5">Title</div>
          <div className="hidden lg:block lg:col-span-3">Upload by</div>
          <div>Delete</div>
          <div className="col-span-4 lg:col-span-2 text-center">
            {/* <Clock className="w-4 h-4 mx-auto" /> */}
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* ส่วนล่าง: รายการเพลงที่อยู่ใน playlist */}
        <div className="space-y-1 h-fit ">
          {playlist.playlist_songs.map((ps, index) => (
            <SongRow
              key={ps.song.id}
              song={ps.song}
              index={index}
              playlistId={playlist.id}
              songs={songsInPlaylist}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
