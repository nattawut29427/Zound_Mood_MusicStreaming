"use client";

import * as React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Mdpic from "@/components/cover_pic/Mdpic";

interface AllplaylistProps {
  onSelectPlaylist?: (id: string) => void;
  selectedPlaylistId?: string | null;
}

export function Allplaylist({ onSelectPlaylist, selectedPlaylistId }: AllplaylistProps) {
  const [playlists, setPlaylists] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/playlist");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const playlistsWithUrls = await Promise.all(
          data.map(async (playlist: any) => {
            const res = await fetch(
              `/api/playsong?key=${encodeURIComponent(playlist.pic_playlists)}`
            );
            const { url } = await res.json();
            return { ...playlist, coverUrl: url };
          })
        );

        setPlaylists(playlistsWithUrls);
      } catch (err: any) {
        setError(`Failed to load playlists: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-white">Loading playlists...</p>
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

  if (playlists.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-400">ยังไม่มี Playlist</p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-hidden">
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 p-2">
          {playlists.map((playlist) => (
            <figure
              key={playlist.id}
              className={`shrink-0 cursor-pointer transition-transform duration-200 ease-in-out ${selectedPlaylistId === playlist.id ? 'scale-105 ring-2 ring-blue-500 rounded-md' : ''}`}
              onClick={() => onSelectPlaylist?.(playlist.id)}
            >
              <div className="overflow-hidden rounded-md ">
                <Mdpic
                  picture={playlist.pic_playlists}
                  
                />
              </div>
              <figcaption className="pt-2 text-xs text-muted-foreground">
                <span className="font-bold text-md text-white block truncate">
                  {playlist.name_playlist}
                </span>
                
              </figcaption>
            </figure>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
