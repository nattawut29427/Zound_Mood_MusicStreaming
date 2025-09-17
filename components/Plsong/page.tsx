// components/SongRow.tsx
"use client";

import { usePlayer } from "@/app/context/Playercontext";
import Smallpic from "@/components/cover_pic/Smallpic";
import Delpl from "@/components/button/Delpl";

interface SongRowProps {
  song: any;
  index: number;
  playlistId: number;
  songs: any[]; //  ต้องส่งเข้ามาจาก parent
}

export default function SongRow({ song, index, playlistId, songs }: SongRowProps) {
  const { playSong } = usePlayer();

  const handlePlay = () => {
    playSong(song, songs); 
  };

  return (
    <div
      onClick={handlePlay}
      className="group grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 cursor-pointer"
    >
      {/* Track Number */}
      <div className="col-span-1 text-center text-gray-400 group-hover:text-white">
        <span>{index + 1}</span>
      </div>

      {/* Song Info */}
      <div className="col-span-6 lg:col-span-5 flex items-center space-x-3">
        <div className="w-12 h-12 relative flex-shrink-0 rounded">
          <Smallpic picture={song.picture ?? ""} name={song.name_song} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate group-hover:text-violet-400 transition-colors duration-200">
            {song.name_song}
          </p>
          <p className="text-sm text-gray-400 truncate">{song.uploader.name}</p>
        </div>
      </div>

      {/* Upload by */}
      <div className="hidden lg:block lg:col-span-3 text-gray-400 text-sm truncate">
        {song.uploader.name}
      </div>

      {/* Delete Button */}
      <div className="col-span-1 flex justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500">
          <Delpl playlistIdToDelete={playlistId} songId={song.id}  />
        </span>
      </div>
    </div>
  );
}
