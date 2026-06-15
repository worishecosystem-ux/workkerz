import type { Metadata } from "next";
import { PlatformProvider } from "../components/context/PlatformContext";
import { LayoutWrapper } from "../components/LayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://workkerz.com"),
  manifest: "/manifest.json",


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
};



export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformProvider>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </PlatformProvider>
  );
}