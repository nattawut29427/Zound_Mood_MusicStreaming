import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LikedSongsClient from "@/components/Like_page/page_like";

export default async function LikedSongsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-white">Unauthorized</div>;
  }

  const likedSongs = await prisma.likeSong.findMany({
    where: { user_id: userId },
    include: {
      song: {
        include: {
          uploader: true,
        },
      },
    },
  });

  return <LikedSongsClient likedSongs={likedSongs} />;
}
