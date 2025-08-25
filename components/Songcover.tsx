  "use client";

  import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";
  import Image from "next/image";
  import { useRef, useState, useEffect } from "react";
  import { Play, Pause, Ellipsis } from "lucide-react";
  import Dropbt from "@/components/button/Dropbt";

  export default function SongCover({
    picture,
    name,
    songId,
    isPlaying,
    onImageChange,
    onPlayClick,
    onPauseClick,
  }: {
    picture: string;
    name: string;
    isPlaying?: boolean;
    songId: number;
    onImageChange?: (file: File) => void;
    onPlayClick?: (e: React.MouseEvent) => void;
    onPauseClick?: (e: React.MouseEvent) => void;
  }) {
    const rawSignedUrl = useCachedSignedUrl(picture);
    const isBlobUrl = picture?.startsWith("blob:");
    const signedUrl = isBlobUrl ? picture : rawSignedUrl;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImageChange) {
        onImageChange(file);
      }
    };

    const togglePlay = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isPlaying) {
        onPauseClick?.(e);
      } else {
        onPlayClick?.(e);
      }
    };

    useEffect(() => {
      if (!picture) return; // ✅ hook ถูกเรียกเสมอ
      if (picture.startsWith("blob:")) {
        setLoading(false);
      } else {
        setLoading(true);
        setError(false);
      }
    }, [picture]);

    console.log("SongCover received songId:", songId)

    return (
      <div className="relative w-48 h-48 group">
        {!picture ? (
          <div className="w-48 h-48 flex items-center justify-center text-gray-400">
            No image
          </div>
        ) : (
          <>
            {/* รูปภาพ */}
            {signedUrl && !error && (
              <Image
                src={signedUrl}
                alt={name}
                fill
                className={`object-cover rounded-md transition-opacity duration-300 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
                onLoadingComplete={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                style={{ zIndex: 10, pointerEvents: "none" }}
              />
            )}

            {/* ปุ่ม Play/Pause */}
            <div className="absolute bottom-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition">
              <button
                className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition cursor-pointer"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* ปุ่ม ... */}
            <div className="absolute top-1 right-2 z-30 opacity-0 group-hover:opacity-100 transition">
              <Dropbt songId={songId} picture={picture} />
              
            </div>

            {/* พื้นหลังมืดตอน hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition z-20 pointer-events-none duration-300" />

            {/* ปุ่ม Upload รูป */}
            {onImageChange && (
              <>
                <div className="absolute inset-0 flex items-center justify-center z-40 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-black px-3 py-1 rounded-full hover:bg-gray-300 cursor-pointer transition"
                  >
                    Upload new image
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </>
        )}
      </div>
    );
  }
