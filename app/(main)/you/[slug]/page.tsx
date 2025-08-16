import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { extractIdFromSlug } from "@/lib/slug";

interface ProfilePageProps {
  params: { slug: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const userId = extractIdFromSlug(params.slug);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return notFound();

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold">{user.name}'s Profile</h1>
      <p>Email: {user.email}</p>
      <img
        src={user.image || "/2.jpg"}
        alt="avatar"
        className="w-24 h-24 rounded-full mt-4"
      />
    </div>
  );
}
