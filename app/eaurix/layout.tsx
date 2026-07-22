import type { Metadata } from "next";
import { PlatformProvider } from "../components/context/PlatformContext";
import MobileBottomBar from "./components/MobileBottomBar";
import HomePlatformToggle from "./components/HomePlatformToggle";
export const metadata: Metadata = {
  metadataBase: new URL("https://e-aurix.com"),

  title: {
    default: "E-Aurix | Construction Materials & Hardware Marketplace",
    template: "%s | E-Aurix",
  },

  description:
    "E-Aurix is India's trusted marketplace for construction materials, hardware products, electrical supplies, plumbing items, tools, cement, steel, tiles, paints, and building solutions.",

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
      <main className="min-h-screen pb-20 md:pb-0">
        {/* Platform Toggle */}
        <div className="">
          <HomePlatformToggle />
        </div>
        {children}
      </main>

      <MobileBottomBar />
    </PlatformProvider>
  );
}
