import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { PlatformProvider } from "../components/context/PlatformContext";

export const metadata: Metadata = {
  title:
    "Workkerz | Book Workers, Buy Materials & Quick Services",
  description:
    "Workkerz is India's worker booking platform. Hire electricians, plumbers, carpenters, drivers, masons and skilled workers. Buy work-related materials through E-Aurix and join as a worker or seller.",

  keywords: [
    "Workkerz",
    "worker booking",
    "hire workers",
    "daily wage workers",
    "construction workers",
    "electrician booking",
    "plumber booking",
    "carpenter booking",
    "driver booking",
    "mason booking",
    "labour booking",
    "worker near me",
    "quick service",
    "buy materials",
    "construction materials",
    "E-Aurix",
    "become worker",
    "become seller",
    "work platform India",
  ],

  openGraph: {
    title:
      "Workkerz | Book Workers, Buy Materials & Quick Services",
    description:
      "Find verified workers, book services, buy materials and grow your business with Workkerz.",
    siteName: "Workkerz",
    type: "website",
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