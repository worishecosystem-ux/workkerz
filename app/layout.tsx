import "./globals.css";
import type { Metadata } from "next";
import { PlatformProvider } from "./components/context/PlatformContext";
import { AdminProvider } from "./components/context/AdminContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Workkerz",
  description: "Workkerz Platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <PlatformProvider>
          <AdminProvider>{children}</AdminProvider>
        </PlatformProvider>

        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: "rounded-2xl",
          }}
        />
      </body>
    </html>
  );
}
