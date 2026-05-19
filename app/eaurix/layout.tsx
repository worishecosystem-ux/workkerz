// app/(public)/layout.tsx
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { PlatformProvider } from "../components/context/PlatformContext";

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