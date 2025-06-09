// components/types.ts

export interface Song {
  id: number;
  name_song: string;
  audio_url: string;
  picture: string;
  uploader: {
    id: number;
    name: string;
    profile: string | null; // ถ้า profile เป็น optional
  };
}

