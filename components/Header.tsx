"use client";

import { useSession, signOut } from "next-auth/react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { generateUserSlug } from "@/lib/slug";
import { useSignedImage } from "@/lib/hooks/useSignedImage";
import { useEffect, useState } from "react";
import Search from "@/components/Header/Search"

export default function Header() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || "");

  const signedAvatar = useSignedImage(avatarUrl);

  // อัปเดตรูปเมื่อ session เปลี่ยน
  useEffect(() => {
    if (session?.user?.image) setAvatarUrl(session.user.image);
  }, [session?.user?.image]);

  return (
    <header className="bg-black p-5 h-16 w-full sticky top-0 z-10 mb-4 pb-2 flex items-center justify-between">
      <div className="text-white font-bold text-2xl">
        <Link href="/">
          <SparklesText>Zound Mood</SparklesText>
        </Link>
      </div>

      <div className="flex-1 max-w-lg ml-40 pt-2.5">
       <Search/>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/feed">
          <Button size="lg" className="rounded-full text-white" variant="ghost">
            Feed
          </Button>
        </Link>

        <Link href="/newupload">
          <Button size="lg" className="rounded-full text-white" variant="ghost">
            Upload
          </Button>
        </Link>

        <Button
          size="lg"
          className="rounded-full text-white"
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/signin" })}
        >
          Signout
        </Button>

        {status === "authenticated" && (
          <Link
            href={`/see/${generateUserSlug({
              id: session.user.id,
              username: session.user.username ?? "unknown",
            })}`}
          >
            <Image
              key={signedAvatar} // รีโหลดรูปเมื่อ URL เปลี่ยน
              src={signedAvatar || "/2.jpg"}
              alt="avatar"
              width={30}
              height={30}
              className="rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-300"
            />
          </Link>
        )}
        {status !== "authenticated" && <div>No avatar</div>}
      </div>
    </header>
  );
}
