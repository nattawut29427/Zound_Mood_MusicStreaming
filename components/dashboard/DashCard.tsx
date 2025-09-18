"use client";

import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import Image from "next/image";

export default function DashCover({
    picture,
    name,
    totalPlays, 
}: {
    picture: string;
    name: string;
    totalPlays: number;
}) {
    const signedUrl = useCachedSignedUrl(picture);

    return (
        <div className="relative  overflow-hidden rounded-xl shadow-md ">
            <Image
                src={signedUrl || "/2.jpg"}
                alt={name}
                width={420}
                height={400}
                className="object-cover aspect-[4/4] hover:scale-110 transition-transform duration-300"
            />

            {/* ยอดฟัง */}
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-4 text-white">
                <h2 className="text-3xl font-extrabold">{name}</h2>
                <p className="text-3xl font-extrabold text-right">
                    {totalPlays.toLocaleString()} Times
                </p>
            </div>
        </div>
    );
}
