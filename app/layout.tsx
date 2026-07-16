import "./globals.css";
import type { Metadata, Viewport } from "next";
import { PlatformProvider } from "./components/context/PlatformContext";
import { AdminProvider } from "./components/context/AdminContext";
import { Toaster } from "sonner";
import BackButtonHandler from "./components/BackButtonHandler";
export const metadata: Metadata = {
  title: "Workkerz",
  description: "Workkerz Platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full"
    >
      <body className="min-h-dvh overflow-x-hidden bg-white antialiased">
        <PlatformProvider>
          <AdminProvider>
           
            <BackButtonHandler />
            {children}
          </AdminProvider>
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