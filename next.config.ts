import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.0.2.2",
    "172.29.22.14",
  ],

  serverExternalPackages: ["pdfkit"],

  devIndicators: false,
};

export default nextConfig;