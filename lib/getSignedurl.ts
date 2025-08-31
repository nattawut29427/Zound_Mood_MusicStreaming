export async function getSignedUrl(key: string): Promise<string | null> {


  try {
    const res = await fetch(`/api/playsong?key=${encodeURIComponent(key)}`);
    const data = await res.json();

    if (res.ok && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error("❌ Error fetching signed URL:", err);
  }

  return null;
}

// export async function getSignedUrl(key: string): Promise<string | null> {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

//     const res = await fetch(`${baseUrl}/api/playsong?key=${encodeURIComponent(key)}`);
//     const data = await res.json();

//     if (res.ok && data.url) {
//       return data.url;
//     }
//   } catch (err) {
//     console.error(" Error fetching signed URL:", err);
//   }

//   return null;  
// }
