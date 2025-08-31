// app/you/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { extractIdFromSlug } from "@/lib/slug";
import ProfileClient from "@/components/profileclient/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const userId = await extractIdFromSlug(params.slug);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,  
      bg_image: true,
    },
  });

  if (!user) return notFound();

  const safeUser = {
  ...user,
  name: user.name || "",
  email: user.email || "",
  image: user.image || "",
  bg_image: user.bg_image || "",
};

  // เช็คว่าผู้ใช้ปัจจุบัน follow user นี้
  const session = await getServerSession(authOptions);
  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        following_user_id_followed_user_id: {
          following_user_id: session.user.id,
          followed_user_id: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return <ProfileClient user={{ ...safeUser, isFollowing,  }} />;
}
