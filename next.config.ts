import type { NextConfig } from "next";

type ImageRemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
};

function backendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/api\/v1\/?$/, "") ||
    "http://127.0.0.1:4000";
  return raw.replace(/\/$/, "").replace(/:\/\/localhost(?=[:/]|$)/, "://127.0.0.1");
}

function r2RemotePatterns(): ImageRemotePattern[] {
  const patterns: ImageRemotePattern[] = [
    {
      protocol: "https",
      hostname: "**.r2.dev",
    },
    {
      protocol: "https",
      hostname: "**.cloudflareusercontent.com",
    },
  ];

  const explicit = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
  if (explicit) {
    try {
      const url = new URL(explicit);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      });
    } catch {
      // ignore invalid URL
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/hamkor",
        destination: "/catalog",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backend = backendOrigin();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backend}/uploads/:path*`,
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
      ...r2RemotePatterns(),
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
