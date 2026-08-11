import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.telegram.org",
      },
      {
        protocol: "https",
        hostname: "pub-f3b38e5cace645bdae0dc2dca5984181.r2.dev",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
