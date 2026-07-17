import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  devIndicators: false,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "172.29.22.14",
  ],
};

export default nextConfig;