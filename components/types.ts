// components/types.ts

export interface Song {
  id: number;
  name_song: string;
  audio_url: string;
  picture: string | null;
  uploader: {
    id: string;
    name: string | null;
    profile?: string | null; // ถ้า profile เป็น optional
    email?: string;
    image?: string | null;
  };
}

// export interface Uploader {
//   id: string;              // เปลี่ยนเป็น string ตาม DB
//   name: string | null;     // ตาม DB
//   profile?: string | null; // ให้เป็น optional
//   email?: string;          // เพิ่มถ้าจะใช้
//   image?: string | null;   // เพิ่มถ้าใช้
//   // เพิ่มฟิลด์อื่นๆถ้าจำเป็น
// }

// export interface Song {
//   id: number;
//   name_song: string;
//   audio_url: string;
//   picture: string | null;
//   uploader: Uploader;
// }
