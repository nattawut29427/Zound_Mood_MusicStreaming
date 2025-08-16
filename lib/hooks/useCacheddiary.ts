import { useEffect, useState } from "react";

const memoryCache = new Map<string, { url: string; expiresAt: number }>();

export function useCachedDiary(key: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔑 useCachedSignedUrl triggered with key:", key);
    
    if (!key) {
      console.warn("🚫 No key provided, clearing URL");
      setUrl(null);
      return;
    }

    // 1. Check memory cache
     const cached = memoryCache.get(key);
    if (cached) {
      if (Date.now() < cached.expiresAt) {
        console.log("⚡️ Found valid URL in memoryCache:", cached.url);
        setUrl(cached.url);
        return;
      } else {
        console.log("⏰ Memory cache expired for key:", key);
        memoryCache.delete(key);
      }
    }

    // 2. Check localStorage
    const stored = localStorage.getItem(`signed-url:${key}`);
    if (stored) {
      try {
        const { url: cachedUrl, expiresAt } = JSON.parse(stored);
        console.log("💾 Found in localStorage:", cachedUrl);

        if (Date.now() < expiresAt) {
          console.log("✅ LocalStorage cache valid, using cached URL");
          memoryCache.set(key, cachedUrl);
          setUrl(cachedUrl);
          return;
        } else {
          console.log("⌛ LocalStorage cache expired");
          localStorage.removeItem(`signed-url:${key}`);
        }
      } catch {
        console.error("❌ Error parsing localStorage JSON");
        localStorage.removeItem(`signed-url:${key}`);
      }
    }

    // 3. Fetch new signed URL
    const fetchUrl = async () => {
      console.log("🌐 Fetching new signed URL for:", key);

      try {
        const res = await fetch(`/api/playsongDiary?key=${encodeURIComponent(key)}`);
        const data = await res.json();

        if (res.ok && data.url) {
          const expiresAt = Date.now() + 1000 * 60 * 5;

          console.log("✅ Fetched URL:", data.url, "Expires At:", new Date(expiresAt).toISOString());

          memoryCache.set(key, data.url);
          localStorage.setItem(
            `signed-url:${key}`,
            JSON.stringify({ url: data.url, expiresAt })
          );

          setUrl(data.url);
        } else {
          console.error("❌ Error fetching signed URL from API:", data.error);
        }
      } catch (err) {
        console.error("🌐 Network error while fetching signed URL", err);
      }
    };

    fetchUrl();
  }, [key]);

  return url;
}
