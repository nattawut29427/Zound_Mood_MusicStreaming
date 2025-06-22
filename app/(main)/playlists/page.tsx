import { prisma } from "@/lib/prisma"
import SongCover from "@/components/Songcover"; 

interface Props {
  params: {
    id: string
  }
}

export default async function SongDetailPage({ params }: Props) {
  const song = await prisma.playlist.findUnique({
    where: {
      id: Number(params.id),
      
    },
    include: {
      playlist_songs: true,
    },
  })

  if (!song) {
    return <div className="text-white">Song not found</div>
  }

  return (
    <div className="text-white p-4">
      <h1 className="text-3xl font-bold">Playlists</h1>
      {/* <SongCover picture={song.pic_playlists ?? ""} name={song.name_playlist} /> */}
      {/* <p className="text-gray-400">Uploaded by: {song.?.name}</p> */}
      {/* เพิ่มข้อมูลอื่น ๆ ได้ตามต้องการ */}
    </div>
  )
}
