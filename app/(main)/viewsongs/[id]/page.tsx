import { prisma } from "@/lib/prisma";
import SongCover from "@/components/Songcover";
import { Heart, Share2 } from "lucide-react";
import AddToPlaylistButton from "@/components/Plus";
import Image from "next/image";
import SongDetailControls from "@/components/SongdetailControl";

export default async function SongDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;

  const song = await prisma.song.findUnique({
    where: { id: Number(resolvedParams.id) }, // ใช้ resolvedParams.id
    include: { uploader: true },
  });

  if (!song) return <div>Song not found</div>;

  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* ส่วนบน: ปก + ข้อมูลเพลง */}
      <div className="flex p-10 space-x-10 bg-black/60 ">
        {/* ปกเพลง */}
        <div className="relative">
          <SongCover picture={song.picture ?? ""} name={song.name_song} />
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
                <Heart className="w-8 h-8  hover:text-red-500 cursor-pointer" />
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
            <Image
              src={song.uploader?.image || "/default-avatar.png"}
              alt={song.uploader?.name || "avatar"}
              fill // ใช้ fill ให้เต็ม container
              style={{ objectFit: "cover" }} // ให้ภาพครอบคลุมพื้นที่
              sizes="96px" // หรือกำหนดขนาดเหมาะสม
            />
          </div>

          <p className="text-gray-300">{song.uploader?.name}</p>
          <button className="bg-white text-black px-4 py-1 rounded-full">
            Follow
          </button>
        </div>

        {/* ด้านขวา: คำอธิบาย */}
        <div className="flex-1 bg-neutral-800 p-6 rounded-md">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          {/* <p>{song.description || "No description provided."}</p> */}
        </div>
        <div className="w-64 bg-black "></div>
      </div>
    </div>
  );
}
