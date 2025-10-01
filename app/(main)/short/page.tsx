"use client";

import { useEffect, useRef, useState, } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
import { Song } from "@/components/types";
import Smallpic from "@/components/cover_pic/Smallpic";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/loading/Loading";
import LoadingOverlay from "@/components/Loadingoveray/page";
import { set } from "lodash";

type UserData = {
    profileKey?: string;
    username?: string;
    songs?: Song[];
};

// helper แปลงวินาที → mm:ss
const formatTime = (time: number) =>
    new Date(time * 1000).toISOString().substr(14, 5);





export default function ShortSongPage({
    onSelect,
}: {
    onSelect?: (data: {
        song_id: number;
        audioUrl: string;
        start: number;
        duration: number;
    }) => void;
}) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const regionRef = useRef<any>(null);

    const [songs, setSongs] = useState<Song[]>([]);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [userData, setUserData] = useState<UserData | null>(null);
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const signedUrl = useCachedSignedUrl(selectedSong?.audio_url);
    const [isSaving, setIsSaving] = useState(false);



    //  โหลดเฉพาะเพลงของ user เอง
    useEffect(() => {
        if (!userId) return;

        async function fetchUserData() {
            try {
                const response = await fetch(`/api/user/${userId}`);
                if (!response.ok) throw new Error("Failed to fetch user data");
                const data = await response.json();

                setUserData(data);
                if (data.songs) {
                    setSongs(data.songs);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        if (!signedUrl || !waveformRef.current) return;

        if (wavesurferRef.current) {
            wavesurferRef.current.stop();
            wavesurferRef.current.destroy();
        }

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
                resize: true,
                drag: true,
            });

            regionRef.current = region;
            setStart(region.start);
            setEnd(region.end);

            regions.on("region-updated", (region) => {
                setStart(region.start);
                setEnd(region.end);
                regionRef.current = region;
                wavesurfer.setTime(region.start);
            });

            wavesurfer.on("audioprocess", () => {
                const current = wavesurfer.getCurrentTime();
                const region = regionRef.current;
                if (region && current >= region.end) {
                    wavesurfer.setTime(region.start);
                }
            });
        });

        wavesurfer.on("play", () => setIsPlaying(true));
        wavesurfer.on("pause", () => setIsPlaying(false));

        wavesurferRef.current = wavesurfer;

        return () => {
            wavesurfer.destroy();
        };
    }, [signedUrl]);

    const handleSaveShortSong = async () => {
        if (!selectedSong) return setMessage("❌ กรุณาเลือกเพลงก่อน");
        if (!signedUrl) return setMessage("❌ กำลังโหลดไฟล์เพลง...");

        setIsSaving(true); // 👉 เริ่มโหลด

        try {
            const getR2KeyFromUrl = (url: string): string => {
                try {
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        const pathname = new URL(url).pathname;
                        const key = pathname.replace(/^\/storagemusic\//, "");
                        return `storagemusic/${decodeURIComponent(key)}`;
                    }
                    return `storagemusic/${decodeURIComponent(url)}`;
                } catch (e) {
                    console.error("Invalid URL for r2Key:", url, e);
                    return url;
                }
            };

            const r2KeyToSend = getR2KeyFromUrl(signedUrl);

            const lambdaRes = await fetch("/api/process-r2-audio", {
                method: "POST",
                body: JSON.stringify({ r2Key: r2KeyToSend, start, duration: end - start }),
                headers: { "Content-Type": "application/json" },
            });

            const lambdaData = await lambdaRes.json();
            if (!lambdaRes.ok) {
                setMessage(`❌ Lambda error: ${lambdaData.message}`);
                return;
            }

            const trimmedR2Key = lambdaData.trimmedR2Key;

            const res = await fetch("/api/short-song", {
                method: "POST",
                body: JSON.stringify({
                    userId: session?.user?.id,
                    songId: selectedSong.id,
                    trimmedR2Key,
                    start,
                    duration: end - start,
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const err = await res.json();
                setMessage(`❌ Save error: ${err.message}`);
                return;
            }

            setMessage("✅ Short Song saved สำเร็จ!");
        } catch (err: any) {
            console.error(err);
            setMessage("❌ เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false); // 👉 ปิด overlay
        }
    };

    return (
        <div className="flex flex-col text-white h-full bg-zinc-900 ">
            <LoadingOverlay show={isSaving} />
            <h2 className="text-lg font-bold p-4">เลือก Short Song ของคุณ</h2>

            {/* Song List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {songs.length === 0 && (
                    <div className="justify-center  m-20 flex">
                        <LoadingSpinner />
                    </div>
                )}
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${selectedSong?.id === song.id
                            ? "bg-black"
                            : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        onClick={() => setSelectedSong(song)}
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
                                    {song.uploader?.name || "คุณ"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Waveform + Controls */}
            {selectedSong && (
                <div className="p-4 border-t h-64 border-zinc-700 bg-zinc-900">
                    <div ref={waveformRef} className="mb-2" />
                    <p className="text-sm mb-2">
                        Start: {formatTime(start)} | End: {formatTime(end)}
                    </p>

                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => wavesurferRef.current?.playPause()}
                            className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                        >
                            {isPlaying ? "⏸ Pause" : "▶ Play"}
                        </button>
                        <button
                            onClick={handleSaveShortSong}
                            className="flex-1 py-2 rounded-lg bg-black hover:bg-black transition"
                        >
                            บันทึก Short Song
                        </button>
                    </div>

                    {message && <p className="text-sm mt-2 text-center">{message}</p>}
                </div>
            )}
        </div>
    );
}
