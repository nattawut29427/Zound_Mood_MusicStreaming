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


// export interface Song {
//   id: number;
//   name_song: string;
//   audio_url: string;
//   picture: string | null;
//   uploader: Uploader;
// }

