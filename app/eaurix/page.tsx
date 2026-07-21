import type { Metadata } from "next";
import { EAurixHome } from "./components/EAurixHome";

export const metadata: Metadata = {
  title: "E-Aurix | Buy Construction Materials, Hardware & Tools Online",

  description:
    "Shop construction materials, hardware products, electrical supplies, plumbing materials, tools, cement, steel, paints, tiles and building products at E-Aurix.",

  
  openGraph: {
    title: "E-Aurix | Construction Materials Marketplace",
    description:
      "Buy hardware, electrical, plumbing, tools, cement, steel, paints, tiles and construction materials online.",
    url: "https://e-aurix.com",
    siteName: "E-Aurix",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "E-Aurix Construction Marketplace",
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

  alternates: {
    canonical: "https://e-aurix.com",
  },
};

export default function Page() {
  return <EAurixHome />;
}