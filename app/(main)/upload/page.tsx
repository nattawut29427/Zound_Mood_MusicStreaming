

import React from "react";
import { useCachedSignedUrl } from "@/lib/hooks/useCachedSignedUrl";

export default function TestCache({ key }: { key: string }) {
  const { url, cacheInfo } = useCachedSignedUrl(key);

  return (
    <div>
      <p>Cache info: {cacheInfo}</p>
      <p>Signed URL: {url ?? "Loading..."}</p>
    </div>
  );
}
