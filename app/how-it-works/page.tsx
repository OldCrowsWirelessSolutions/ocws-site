import HowToScan from "@/app/components/HowToScan";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Old Crows Wireless Solutions",
  description:
    "Three screenshots from your phone. That's all Corvus needs to diagnose your wireless environment and render a full Verdict.",
};

export default function HowItWorksPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      {/* Page header */}
      <section
        className="py-16"
        style={{ background: "#0D1520", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="ocws-container text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#00C2C7", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Crow&rsquo;s Eye &middot; Getting Started
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Three screenshots. That&rsquo;s it.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#8AAABB" }}>
            Download a free app, take three screenshots of your Wi-Fi environment,
            and Corvus does the rest. No hardware. No account required to start.
          </p>
        </div>
      </section>

      {/* Interactive walkthrough */}
      <HowToScan />
    </main>
  );
}
