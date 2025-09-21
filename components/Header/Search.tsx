"use client";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import Link from "next/link";
import Smallpic from "@/components/cover_pic/Smallpic"

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const searchSongs = async (q: string) => {
        if (!q) return setResults([]);
        setLoading(true);
        try {
            const res = await fetch(`/api/service/Search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.songs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Debounce เพื่อไม่ให้ call API ทุก keypress
    const debouncedSearch = debounce(searchSongs, 300);

    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query]);

    return (
        <div className="relative w-full z-50">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for songs, artists..."
                className="w-full h-10 px-4 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none"
            />

            {query && (
               <div className="fixed left-0 right-0 top-20 mx-auto w-full max-w-xl bg-black text-white rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
                    {loading && <div className="p-2">Loading...</div>}
                    {!loading && results.length === 0 && <div className="p-2">No results found</div>}
                    {!loading && results.map((song) => (
                        <Link
                            key={song.id}
                            href={`/viewsongs/${song.id}`}
                            className="flex items-center px-4 py-2 hover:bg-neutral-800 duration-300"
                        >
                            <Smallpic
                                picture={song.picture}
                                name={song.name_song}
                            />
                            <span className="ml-4">
                                {song.name_song} - {song.uploader.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
