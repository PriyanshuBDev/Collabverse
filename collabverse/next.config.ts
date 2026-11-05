import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // Load remote images directly in the browser to avoid server-side
    // optimizer timeouts when Supabase Storage is slow to respond.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hatrabbits.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "kyznptftswmrlawobffq.supabase.co",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
