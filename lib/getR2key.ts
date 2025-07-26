export const getR2KeyFromUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const p = new URL(url).pathname.substring(1);
    return `storagemusic/${p}`;
  }
  return `storagemusic/${url}`;
};