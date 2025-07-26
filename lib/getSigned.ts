
export async function getSignedPictureUrl(key: string): Promise<string> {
  const res = await fetch(`/api/playsong?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('Failed to get signed image URL');
  const data = await res.json();
  return data.url;
}

