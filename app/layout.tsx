// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StickyQuoteCTA from "./components/StickyQuoteCTA";

export const metadata: Metadata = {
  title: "Old Crows Wireless Solutions (OCWS)",
  description: "Strategic RF Engineering & Wireless Intelligence",
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
      </body>
    </html>
  );
}
