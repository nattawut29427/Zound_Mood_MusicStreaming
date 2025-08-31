// lib/hooks/useSignedImage.ts
"use client";
import { useState, useEffect } from "react";
import { getSignedPictureUrl } from "../getSigned";

export function useSignedImage(keyOrUrl?: string) {
  const [url, setUrl] = useState<string>("");
  

  useEffect(() => {
    if (!keyOrUrl) return;

    // ถ้าเป็น external URL ใช้ตรง ๆ
    if (keyOrUrl.startsWith("http")) {
      setUrl(keyOrUrl);
      return;
    }

    // ถ้าเป็น R2 key ให้ generate signed URL
    const loadUrl = async () => {
      try {
        const signedUrl = await getSignedPictureUrl(keyOrUrl);
        setUrl(signedUrl);
      } catch (err) {
        console.error("Failed to get signed URL", err);
        const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
        if (publicDomain) setUrl(`https://${publicDomain}/${keyOrUrl}`);
      }
    };

    loadUrl();
  }, [keyOrUrl]);

  return url;
}
