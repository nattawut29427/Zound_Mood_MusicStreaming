"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";

import { Song } from "@/components/types";
import Smallpic from "@/components/cover_pic/Smallpic";

const getR2KeyFromUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const p = new URL(url).pathname.substring(1);
    return `storagemusic/${p}`;
  }
  return `storagemusic/${url}`;
};

export default function SelectMusicPage({
  onSelect,
}: {
  onSelect?: (data: { song_id: number;  audioUrl: string; start: number; duration: number }) => void;
}) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(30);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const signedUrl = useCachedSignedUrl(selectedSong?.audio_url);

  useEffect(() => {
    const fetchSongs = async () => {
      const res = await fetch("/api/song");
      const data = await res.json();
      setSongs(data.songs);
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    if (!signedUrl || !waveformRef.current) return;

    wavesurferRef.current?.destroy();

    const regions = RegionsPlugin.create();
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(244, 28, 85, 0.8)",
      progressColor: "white",
      height: 64,
      barWidth: 5,
      barRadius: 100,
      responsive: true,
      minPxPerSec: 10,
      hideScrollbar: true,
      plugins: [regions],
    });

    wavesurfer.load(signedUrl);
    wavesurfer.on("ready", () => {
      const totalDuration = wavesurfer.getDuration();
      const region = regions.addRegion({
        start: 0,
        end: Math.min(30, totalDuration),
        color: "rgba(255,255,255,0.2)",
        resize: false,
        drag: true,
      });

      regionRef.current = region;
      setStart(region.start);
      setEnd(region.end);

      setTimeout(() => {
        const el = region.element as HTMLElement;
        if (el) {
          el.style.border = "3px solid white";
          el.style.borderRadius = "8px";
        }
      }, 100);

      regions.on("region-updated", (region) => {
        setStart(region.start);
        setEnd(region.end);
        regionRef.current = region;

        wavesurfer.setTime(region.start);
        wavesurfer.play();
      });

      wavesurfer.on("audioprocess", () => {
        const current = wavesurfer.getCurrentTime();
        const region = regionRef.current;
        if (region && current >= region.end) {
          wavesurfer.setTime(region.start);
        }
      });

      wavesurfer.setTime(region.start);
      wavesurfer.play();
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [signedUrl]);

  const handleSelect = (song: Song) => {
    setSelectedSong(song);
    setMessage(null);
  };

  const handleSubmit = () => {
    if (!selectedSong) {
      setMessage("❌ กรุณาเลือกเพลงก่อน");
      return;
    }
    setMessage(null);

    if (onSelect) {
      onSelect({
        song_id: selectedSong.id,
        audioUrl: selectedSong.audio_url,
        start,
        duration: end - start,
      });
    }
  };

  const filteredSongs = songs.filter((s) =>
    s.name_song.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col text-white h-full overflow-hidden bg-zinc-900 rounded-t-2xl">
      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="ค้นหาเพลง..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-lg px-4 bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedSong?.id === song.id
                ? "bg-black"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
            onClick={() => handleSelect(song)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0">
                <Smallpic
                  picture={song.picture || "error"}
                  name={song.name_song}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{song.name_song}</p>
                <p className="text-sm text-gray-400 truncate">
                  {song.uploader?.name || "ไม่ระบุศิลปิน"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Waveform + Submit */}
      {selectedSong && (
        <div className="p-4 border-t border-zinc-700 bg-zinc-900">
          <div ref={waveformRef} className="mb-2" />
          <p className="text-sm mb-2">
            Start: {start.toFixed(2)}s | End: {end.toFixed(2)}s
          </p>
          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-lg bg-black hover:bg-black transition"
          >
             เลือกเพลงนี้
          </button>
          {message && <p className="text-sm mt-2 text-center">{message}</p>}
        </div>
      )}
    </div>
  );
}
