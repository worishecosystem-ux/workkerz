import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  devIndicators: false,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.247.1.137",
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