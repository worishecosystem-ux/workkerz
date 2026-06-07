// app/(public)/layout.tsx

import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { PlatformProvider } from "../components/context/PlatformContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://e-aurix.com"),

  title: {
    default: "E-Aurix | Construction Materials & Hardware Marketplace",
    template: "%s | E-Aurix",
  },

  description:
    "E-Aurix is India's trusted marketplace for construction materials, hardware products, electrical supplies, plumbing items, tools, cement, steel, tiles, paints, and building solutions.",

  keywords: [
    "E-Aurix",
    "construction materials",
    "building materials",
    "hardware store online",
    "buy cement online",
    "TMT steel",
    "electrical supplies",
    "plumbing materials",
    "construction tools",
    "industrial tools",
    "tiles and sanitary",
    "paint supplies",
    "building products",
    "construction marketplace",
    "hardware marketplace India",
    "construction equipment",
    "masonry materials",
    "civil construction materials",
    "contractor supplies",
    "construction products India",
    "online hardware shop",
    "construction supplier",
    "building hardware",
    "construction ecommerce",
    "E Aurix India",
  ],

  authors: [
    {
      name: "E-Aurix",
    },
  ],

  creator: "E-Aurix",

  publisher: "E-Aurix",

  openGraph: {
    title: "E-Aurix | Construction Materials Marketplace",
    description:
      "Buy construction materials, hardware, electrical supplies, plumbing products, tools, cement, steel, and building solutions online.",
    url: "https://e-aurix.com",
    siteName: "E-Aurix",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "E-Aurix Marketplace",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "E-Aurix Marketplace",
    description:
      "Construction materials, hardware, plumbing, electrical and tools marketplace.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "Construction & Hardware Marketplace",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformProvider>
      <Navbar />
      {children}
      <Footer />
    </PlatformProvider>
  );
}