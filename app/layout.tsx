import "./globals.css";
import { PlatformProvider } from "./components/context/PlatformContext";
import { AdminProvider } from "./components/context/AdminContext";
import { Toaster } from "sonner";

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
