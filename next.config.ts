import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  devIndicators: false,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.137.37",
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