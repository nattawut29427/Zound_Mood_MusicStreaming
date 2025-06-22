// lib/hooks/useSignedImage.ts
"use client";
import { useEffect, useState } from "react";
import { getSignedPictureUrl } from "../getSigned";

export function useSignedImage(key: string | undefined) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!key) return;

    const loadUrl = async () => {
      try {
        const signedUrl = await getSignedPictureUrl(key);
        setUrl(signedUrl);
      } catch (err) {
        console.error("โหลด signed URL ไม่สำเร็จ", err);
      }
    };

    loadUrl();
  }, [key]);

  return url;
}
