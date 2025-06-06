"use client";

import * as React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/app/context/Playercontext";


export function ScrollAreaHorizontalDemo() {
  const [sections, setSections] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { playSong } = usePlayer(); 


  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/feed");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const sectionsWithUrls = await Promise.all(
          data.sections.map(async (section: any) => {
            const feedItemsWithUrls = await Promise.all(
              section.feed_items.map(async (item: any) => {
                const res = await fetch(`/api/playsong?key=${encodeURIComponent(item.song.picture)}`);
                if (!res.ok) throw new Error("Cannot fetch picture signed URL");

                const { url } = await res.json();
                return {
                  ...item,
                  song: { ...item.song, pictureUrl: url },
                };
              })
            );
            return { ...section, feed_items: feedItemsWithUrls };
          })
        );

        setSections(sectionsWithUrls);
      } catch (err: any) {
        console.error("Failed to fetch songs:", err);
        setError(`Failed to load songs: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-white">Loading songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-400">No songs uploaded yet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
      {sections.map((section) => (
        <div key={section.id} className="mb-8">
          <h2 className="text-white font-bold text-3xl mb-4">{section.title}</h2>

          <div className="flex w-max space-x-4 overflow-x-auto">
            {section.feed_items.map((item: any) => {
              const song = item.song;
              return (
                <figure
                  key={song.id}
                  className="shrink-0 cursor-pointer"
                  onClick={() => playSong(song)} // ⬅️ เล่นเพลงเมื่อคลิก
                >
                  <div className="overflow-hidden rounded-md">
                    <Image
                      src={song.pictureUrl}
                      alt={`Album art for ${song.name_song}`}
                      className="aspect-[4/4] h-44 w-fit object-cover hover:scale-110 transition-transform duration-300"
                      width={228}
                      height={100}
                    />
                  </div>
                  <figcaption className="pt-2 text-xs text-muted-foreground">
                    <span className="font-bold text-md text-white">{song.name_song}</span>
                    <p className="text-md font-semibold text-muted-foreground">
                      {song.uploader.username}
                    </p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}
