"use client";
import { useSession } from "next-auth/react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { generateUserSlug } from "@/lib/slug";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-black p-5 h-16 w-full sticky top-0 z-10 mb-4 pb-2 flex items-center justify-between">
      <div className="text-white font-bold text-2xl">
        <Link href="/">


          <SparklesText>Zound Mood</SparklesText>
        </Link>
      </div>

      <div className="flex-1 max-w-lg ml-40 pt-2.5">
        <input
          type="text"
          placeholder="Type your song..."
          className="w-full h-10 px-4 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/feed">
          <Button
            size="lg"
            className="rounded-full text-white cursor-pointer"
            variant="ghost"
          >
            Feed
          </Button>
        </Link>
        <div className="bg-white h-10 rounded-full w-1 bg-gradient-to-b from-red-500 to-pink-400"></div>
        <Link href="/newupload">
          <Button
            size="lg"
            className="rounded-full text-white cursor-pointer"
            variant="ghost"
          >
            Upload
          </Button>
        </Link>
        <Button
          size="lg"
          className="rounded-full text-white cursor-pointer"
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/signin" })}
        >
          signout
        </Button>

        {status === "authenticated" && session ? (
          <Link
            href={`/see/${generateUserSlug({
              id: session.user.id,
              username: session.user.username ?? "unknown",
            })}`}
          >
            <Image
              src={session.user?.image || "/2.jpg"}
              alt="avatar"
              width={30}
              height={30}
              className="rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-300"
            />
          </Link>
        ) : (
          <div>No avatar</div>
        )}
      </div>
    </header>
  );
}
