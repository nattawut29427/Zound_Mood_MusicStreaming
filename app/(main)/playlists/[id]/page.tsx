import { prisma } from "@/lib/prisma";
import PlaylistsCover from "@/components/PlaylistCover";
import { Heart, Share2 } from "lucide-react";
import AddToPlaylistButton from "@/components/Plus";
import Smallpic from "@/components/cover_pic/Smallpic";
import Loading from "@/components/loading/Loading";

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

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10 space-x-10 bg-black/60 ">
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
              <button className="w-10 h-10 bg-white  rounded-full text-black   hover:scale-105 transition">
                ▶
              </button>
            </div>
            <div className="text-sm px-4 py-1 rounded-full">
              <div className="flex space-x-6">
                {/* {/* <Heart className="w-8 h-8  hover:text-red-500 cursor-pointer" />
                 <AddToPlaylistButton songId={song.id}  picture={song.picture ?? ""}/> */}
                <Share2 className="w-9 h-9   hover:text-yellow-300 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Songs List Section */}
      <div className="px-8 lg:px-10 pb-8">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-400 border-b border-neutral-700/50 mb-4">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 lg:col-span-5">Title</div>
          <div className="hidden lg:block lg:col-span-3">Album</div>
          <div className="col-span-4 lg:col-span-2 text-center">
            {/* <Clock className="w-4 h-4 mx-auto" /> */}
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* ส่วนล่าง: รายการเพลงที่อยู่ใน playlist */}
        <div className="space-y-1 h-fit ">
          {playlist.playlist_songs.map((ps, index) => (
            <div
              key={ps.song.id}
              className="group grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 cursor-pointer"
            >
              {/* Track Number */}
              <div className="col-span-1 text-center text-gray-400 group-hover:text-white">
                <span className="group-hover:hidden">{index + 1}</span>
                {/* <Play
                className="w-4 h-4 hidden group-hover:block mx-auto"
                fill="currentColor"
              /> */}
              </div>

              {/* Song Info */}
              <div className="col-span-6  lg:col-span-5 flex items-center space-x-3">
                <div className="h-fit">
                  <div className="w-12 h-12 relative flex-shrink-0 rounded ">
                    <Smallpic
                      picture={ps.song.picture ?? ""}
                      name={ps.song.name_song}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate group-hover:text-green-400 transition-colors duration-200">
                    {ps.song.name_song}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {ps.song.uploader.name}
                  </p>
                </div>
              </div>

              {/* Album (Hidden on mobile) */}
              <div className="hidden lg:block lg:col-span-3 text-gray-400 text-sm truncate">
                {ps.song.uploader.name}
              </div>

              {/* Duration */}
              {/* <div className="col-span-4 lg:col-span-2 text-center text-gray-400 text-sm">
              {ps.song.duration}
            </div> */}

              {/* Actions */}
              <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center space-x-2">
                  <AddToPlaylistButton
                    songId={ps.song.id}
                    picture={ps.song.picture ?? ""}
                  />
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
