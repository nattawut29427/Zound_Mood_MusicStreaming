import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com','i.pinimg.com','lh3.googleusercontent.com'], // เพิ่มโดเมนนี้
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storagemusic.dec00e8d8adbdf7cae2dbc14fd9b9ff3.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },

   experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      // allowedOrigins: [], // ถ้าต้องการกำหนด CORS
    },
  },
};

export default nextConfig;
