// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StickyQuoteCTA from "./components/StickyQuoteCTA";
import CorvusChatWrapper from "./components/CorvusChatWrapper";
import ActivityTracker from "./components/ActivityTracker";
import AudioInit from "./components/AudioInit";
import CorvusSprite from "@/components/CorvusSprite";
import CircuitBackground from "@/app/components/CircuitBackground";

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
        {/* Sitewide animated PCB circuit trace background — fixed behind all content */}
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <CircuitBackground />
        </div>
        {/* Set default audio preference on first visit */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (!localStorage.getItem('corvus_audio')) {
              var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              localStorage.setItem('corvus_audio', isMobile ? 'false' : 'true');
            }
          })();
        ` }} />
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

        {/* Activity tracker — inactivity timeout, domain exit logout, multi-tab sync */}
        <ActivityTracker />
        <AudioInit />
        <CorvusSprite frequency="normal" />
        <Analytics />
      </body>
    </html>
  );
}
