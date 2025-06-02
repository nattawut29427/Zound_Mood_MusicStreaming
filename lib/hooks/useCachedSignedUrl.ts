// hooks/useCachedSignedUrl.ts
import { useEffect, useState } from "react";

const signedUrlCache = new Map<string, string>();

export function useCachedSignedUrl(key: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;

    // ถ้ามีอยู่ในแคช
    if (signedUrlCache.has(key)) {
      setUrl(signedUrlCache.get(key)!);
      return;
    }

    const fetchUrl = async () => {
      const res = await fetch(`/api/playsong?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (res.ok && data.url) {
        signedUrlCache.set(key, data.url); // แคชไว้
        setUrl(data.url);
      } else {
        console.error("Error fetching signed URL", data.error);
      }
    };

    fetchUrl();
  }, [key]);

  return url;
}
