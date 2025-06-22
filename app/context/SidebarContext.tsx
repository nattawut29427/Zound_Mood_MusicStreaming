// context/SidebarContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
type SidebarView = "default" | "createPlaylist";

interface SidebarContextType {
  view: SidebarView;
  setView: (view: SidebarView, songData?: { id: number; picture: string }) => void;
  selectedSong: { id: number; picture: string } | null;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [view, setViewInternal] = useState<SidebarView>("default");
  const [selectedSong, setSelectedSong] = useState<{ id: number; picture: string } | null>(null);

   const setView = (view: SidebarView, songData?: { id: number; picture: string }) => {
    setViewInternal(view);
    if (songData) {
      setSelectedSong(songData);
    }
  };

  return (
    <SidebarContext.Provider value={{ view, setView, selectedSong }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
};
