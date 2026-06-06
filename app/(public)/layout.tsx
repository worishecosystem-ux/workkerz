import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { PlatformProvider } from "../components/context/PlatformContext";



export const metadata: Metadata = {
  metadataBase: new URL("https://workkerz.com"),

  title: "Workkerz | Book Workers, Buy Materials & Quick Services",

  description:
    "Workkerz is India's worker booking platform. Hire electricians, plumbers, carpenters, drivers, masons and skilled workers. Buy work-related materials through E-Aurix and join as a worker or seller.",

  keywords: [
    "Workkerz",
    "Workkerz India",
    "worker booking app",
    "hire workers online",
    "book workers near me",
    "daily wage workers",
    "skilled workers",
    "construction workers",
    "labour booking",
    "electrician near me",
    "plumber near me",
    "carpenter near me",
    "driver near me",
    "mason near me",
    "house cleaning services",
    "AC repair services",
    "home maintenance services",
    "quick services",
    "verified workers",
    "worker marketplace",
    "worker hiring platform",
    "construction labour",
    "industrial workers",
    "civil workers",
    "painting services",
    "fabrication workers",
    "work opportunities",
    "job work platform",
    "worker app India",
    "construction materials",
    "building materials",
    "buy construction materials online",
    "cement suppliers",
    "steel suppliers",
    "hardware store online",
    "electrical materials",
    "plumbing materials",
    "tools and equipment",
    "E-Aurix",
    "become a worker",
    "worker registration",
    "become a seller",
    "seller registration",
    "material supplier platform",
    "Workkerz worker app",
    "Workkerz seller app",
    "India worker marketplace",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title:
      "Workkerz | Book Workers, Buy Materials & Quick Services",

    description:
      "Find verified workers, book services, buy materials through E-Aurix, and grow your business with Workkerz.",

    url: "https://workkerz.com",

    siteName: "Workkerz",

    type: "website",

    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Workkerz | Book Workers, Buy Materials & Quick Services",
    description:
      "Hire verified workers, buy materials, request quick services, become a worker or seller with Workkerz.",
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