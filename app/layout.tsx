// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StickyQuoteCTA from "./components/StickyQuoteCTA";
import CorvusChatWrapper from "./components/CorvusChatWrapper";

export const metadata: Metadata = {
  title: "Old Crows Wireless Solutions (OCWS)",
  description: "Strategic RF Engineering & Wireless Intelligence",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global background styling */}
        <div className="ocws-bg">
          {/* Top navigation */}
          <Navbar />

          {/* Sticky quote button (site-wide) */}
          <StickyQuoteCTA />

          {/* Page content */}
          <main className="ocws-page">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Corvus chat — persists for authenticated subscribers across all pages */}
        <CorvusChatWrapper />
      </body>
    </html>
  );
}
