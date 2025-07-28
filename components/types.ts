// components/types.ts

export interface Uploader {
  id: string;              
  name: string | null;     

}

export interface Song {
  id: number;
  name_song: string;
  audio_url: string;
  picture: string | null;
  description?: string | null;
  uploaded_by: string;
  uploader?: Uploader | null;
}

export interface Diary {
  id: number;
  name_diary: string;
  content: string; // HTML content
  trimmed_audio_url: string;
  song_id: number;
  user_id: string;
  is_private: boolean;
  created_at: Date;
  song?: Song | null; // Optional relation
  user?: Uploader | null; // Optional relation
}


// export interface Song {
//   id: number;
//   name_song: string;
//   audio_url: string;
//   picture: string | null;
//   uploader: Uploader;
// }

