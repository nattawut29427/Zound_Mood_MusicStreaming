"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// view ที่ Sidebar รองรับ
type SidebarView =
  | "default"
  | "createPlaylist"
  | "createDiary"
  | "createNewPlaylist"
  | "editPlaylist";

// ประเภทของเพลงที่เลือก
type SongData = {
  id: number;
  picture: string;
};

// ประเภทของ playlist ที่เลือก (ใช้ในหน้า edit)
type PlaylistData = {
  id: number;
  name_playlist: string;
  picture: string;
};

interface SidebarContextType {
  view: SidebarView;
  setView: (
    view: SidebarView,
    songData?: SongData,
    playlistData?: PlaylistData
  ) => void;
  selectedSong: SongData | null;
  selectedPlaylist: PlaylistData | null;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [view, setViewInternal] = useState<SidebarView>("default");

  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistData | null>(
    null
  );

  const setView = (
    view: SidebarView,
    songData?: SongData,
    playlistData?: PlaylistData
  ) => {
    setViewInternal(view);

    if (songData) {
      setSelectedSong(songData);
    }

    if (playlistData) {
      setSelectedPlaylist(playlistData);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        view,
        setView,
        selectedSong,
        selectedPlaylist,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }
  return context;
};
