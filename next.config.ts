import type { NextConfig } from "next";

function backendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/api\/v1\/?$/, "") ||
    "http://127.0.0.1:4000";
  return raw.replace(/\/$/, "").replace(/:\/\/localhost(?=[:/]|$)/, "://127.0.0.1");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin()}/api/v1/:path*`,
      },
    ];
  },
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
