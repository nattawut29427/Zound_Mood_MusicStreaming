"use client";
import React, { createContext, useContext, useState } from "react";

interface PlaylistContextProps {
  songIds: string[];
  playlistName: string;
  pictureUrl: string;
  reason: string;
  setData: (data: {
    songIds: string[];
    playlistName: string;
    pictureUrl: string;
    reason: string;
  }) => void;
}

const GeneratedPlaylistContext = createContext<PlaylistContextProps | null>(null);

export const useGeneratedPlaylist = () => {
  const context = useContext(GeneratedPlaylistContext);
  if (!context) throw new Error("useGeneratedPlaylist must be used inside provider");
  return context;
};

export const GeneratedPlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const [songIds, setSongIds] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [reason, setReason] = useState("");

  const setData = ({ songIds, playlistName, pictureUrl, reason }: PlaylistContextProps) => {
    setSongIds(songIds);
    setPlaylistName(playlistName);
    setPictureUrl(pictureUrl);
    setReason(reason);
  };

  return (
    <GeneratedPlaylistContext.Provider
      value={{ songIds, playlistName, pictureUrl, reason, setData }}
    >
      {children}
    </GeneratedPlaylistContext.Provider>
  );
};
