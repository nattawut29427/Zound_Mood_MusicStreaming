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
        console.error("Failed to get signed URL", err);

        const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
        if (publicDomain) {
          setUrl(`https://${publicDomain}/${key}`);
        }
      }
    };

    loadUrl();
  }, [key]);

  return url;
}
