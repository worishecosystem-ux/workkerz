import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  devIndicators: false,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.137.231",
  ],
};

export default nextConfig;