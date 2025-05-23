import * as React from "react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


export interface Artwork {
  artist: string;
  art: string;
  audio: string;
  name?: string;
}

export const works: Artwork[] = [
  {
    artist: "Your face",
    art: "https://i.pinimg.com/736x/7f/a7/24/7fa724ab70ee0b1345dcbb9cb015b840.jpg",
    audio: "/audio/song.mp3",
    name: "Wips"
  },
  {
    artist: "Here With Me",
    art: "https://i.pinimg.com/originals/5c/91/1c/5c911c717690bb3ab7899a1a98b01826.gif",
    audio: "/audio/song2.mp3",
    name: "d4vd"
  },
  {
    artist: "Vladimir Malyavko",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "https://youtu.be/2fUuMHSbyyc?si=76mWbjTdRMXp3dPh",
  },
  {
    artist: "new",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song4.mp3",
  },
  {
    artist: "kam",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song5.mp3",      
  },
  {
    artist: "teso",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song6.mp3",  
  },
  {
    artist: "test",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song7.mp3",  
  },
  {
    artist: "test1",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song8.mp3",
  },
  {
    artist: "test2",
    art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
    audio: "/audio/song9.mp3",
  },
];

interface ScrollAreaHorizontalDemoProps {
  onSelect?: (artwork: Artwork) => void;
}

export function ScrollAreaHorizontalDemo({ onSelect }: ScrollAreaHorizontalDemoProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
      <div className="flex w-max space-x-4 p-4">
        {works.map((artwork, index) => (
          <figure
            key={`${artwork.artist}-${index}`}
            className="shrink-0 cursor-pointer"
            onClick={() => onSelect?.(artwork)}
          >
            <div className="overflow-hidden rounded-md ">
              <Image
                src={artwork.art}
                alt={`Photo by ${artwork.artist}`}
                className="aspect-[4/4] h-44 w-fit object-cover hover:scale-110 transition-transform duration-300"
                width={228}
                height={100}
              />
            </div>
            <figcaption className="pt-2 text-xs text-muted-foreground">
              <span className="font-bold text-md text-white">
                {artwork.artist}
              </span>
              <p className="text-md font-semibold text-muted-foreground">{artwork.name}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
