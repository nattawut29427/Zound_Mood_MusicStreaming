// lib/hooks/useSignedImage.ts
"use client";
import { useEffect, useState } from "react";
import { getSignedPictureUrl } from "../getSigned";

export function useSignedImage(key: string | undefined) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!key) return;

    // ตรวจสอบว่า key เป็น URL เต็มอยู่แล้ว
    if (key.startsWith("https://")) {
      setUrl(key);
      return;
    }

    const loadUrl = async () => {
      try {
        const signedUrl = await getSignedPictureUrl(key);
        setUrl(signedUrl);
      } catch (err) {
        console.error("Failed to get signed URL", err);
        
        // สร้าง public URL เป็น fallback
        const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
        if (publicDomain) {
          setUrl(`https://${publicDomain}/${key}`);
        } else {
          console.error("NEXT_PUBLIC_R2_PUBLIC_DOMAIN is not set");
        }
      }
    };

    loadUrl();
  }, [key]);

  return url;
}