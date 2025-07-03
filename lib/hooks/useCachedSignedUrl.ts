// hooks/useCachedSignedUrl.ts
import { useEffect, useState } from "react";

const memoryCache = new Map<string, string>();

export function useCachedSignedUrl(key: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;

    // 1. เช็คใน memory cache
    if (memoryCache.has(key)) {
      setUrl(memoryCache.get(key)!);
      return;
    }

    // 2. เช็คใน localStorage
    const stored = localStorage.getItem(`signed-url:${key}`);
    if (stored) {
      try {
        const { url: cachedUrl, expiresAt } = JSON.parse(stored);

        // ตรวจสอบว่า URL หมดอายุหรือยัง
        if (Date.now() < expiresAt) {
          memoryCache.set(key, cachedUrl);
          setUrl(cachedUrl);
          return;
        } else {
          localStorage.removeItem(`signed-url:${key}`);
        }
      } catch {
        // ถ้ามีปัญหา JSON
        localStorage.removeItem(`signed-url:${key}`);
      }
    }

    // 3. ถ้ายังไม่มี => fetch ใหม่
    const fetchUrl = async () => {
      try {
        const res = await fetch(`/api/playsong?key=${encodeURIComponent(key)}`);
        const data = await res.json();

        if (res.ok && data.url) {
          const expiresAt = Date.now() + 1000 * 60 * 10; // เก็บ 10 นาที

          memoryCache.set(key, data.url);
          localStorage.setItem(
            `signed-url:${key}`,
            JSON.stringify({ url: data.url, expiresAt })
          );

          setUrl(data.url);
        } else {
          console.error("Error fetching signed URL", data.error);
        }
      } catch (err) {
        console.error("Network error fetching signed URL", err);
      }
    };

    fetchUrl();
  }, [key]);

  return url;
}
