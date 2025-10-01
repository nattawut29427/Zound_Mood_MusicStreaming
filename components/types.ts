// components/types.ts

export interface Uploader {
  id: string;              
  name: string | null;
  image: string | null;     

}

export interface Song {
  id: number;
  name_song: string;
  audio_url: string;
  picture: string | null;
  description?: string | null;
  uploaded_by: string;
  uploader?: Uploader | null;
  SongStat: {
    song_id: number;
    play_count: number;
    like_count: number;
  }
}

export interface Diary {
  id: number;
  name_diary: string;
  content: string; // HTML content
  trimmed_audio_url: string;
  song_id: number;
  user_id: string;
  is_private: boolean;
  created_at: string;
  song_removed: false;
  song?: Song | null; // Optional relation
  user?: Uploader | null; // Optional relation
}

export interface ShortSong {
  id: number;
  trimmedR2Key: string;
  start: number;
  duration: number;
  createdAt: string;
  _replay?: number;
  user: {
    id: string;
    name: string;
    image: string;
  };
  song: {
    id: number;
    name_song: string;  // ใช้ตรงกับ DB
    artist: string;
    picture: string;
  };
}