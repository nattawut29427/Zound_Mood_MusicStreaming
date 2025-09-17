import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/app/context/Playercontext";
import SongCover from "@/components/Songcover";
import Link from "next/link";
import LoadingSpinner from "../loading/Loading";

export function ScrollAreaHorizontalDemo() {
  const [sections, setSections] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { playSong, stop, currentTrack, isPlaying } = usePlayer();

  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/feed");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setSections(data.sections);
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
      <div className="flex justify-center items-center h-40 m-auto">
        <LoadingSpinner />
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
    <div className="p-10 max-w-full overflow-x-hidden">
      {sections.map((section) => (
        <div key={section.id} className="mb-8">
          <h2 className="text-white font-bold text-3xl mb-4">
            {section.title}
          </h2>

          <ScrollArea className="w-full">
            <div className="flex w-max space-x-10 p-2">
              {section.feed_items.map((item: any) => {
                const song = item.song;
                const songIsPlaying = currentTrack?.id === song.id && isPlaying;

                return (
                  <Link
                    key={song.id}
                    href={`/viewsongs/${song.id}`}
                    className="block rounded-lg hover:opacity-80 transition"
                  >
                    <figure
                      key={song.id}
                      className="shrink-0 cursor-pointer w-44"
                    >
                      <SongCover
                        songId={song.id}
                        picture={song.picture}
                        name={song.name_song}
                        isPlaying={songIsPlaying} // ส่งสถานะเข้าไป
                        onPlayClick={() => playSong(song)}
                        onPauseClick={() => stop()}
                      />

                      <figcaption className="pt-2 text-xs text-muted-foreground">
                        <div className="overflow-hidden w-full group">
                          <span
                            className={`block font-bold text-md text-white whitespace-nowrap ${song.name_song.length > 30 ? "group-hover:animate-marquee" : ""
                              }`}
                          >
                            {song.name_song}
                          </span>
                        </div>
                        <p className="text-md font-semibold text-muted-foreground">
                          {song.uploader.name}
                        </p>
                      </figcaption>
                    </figure>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
