import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  devIndicators: false,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "172.29.22.14",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wynidtiortpdblfltcom.supabase.co",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
};

export default nextConfig;