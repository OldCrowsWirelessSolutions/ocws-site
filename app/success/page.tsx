// app/success/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Confirmed | Crow's Eye",
  description: "Your payment was received. Corvus is ready.",
};

export default function SuccessPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }} className="flex items-center justify-center">
      <div className="ocws-container py-24 text-center max-w-lg mx-auto">
        <p className="text-5xl mb-6">🐦‍⬛</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Corvus has your payment.
        </h1>
        <p className="text-base mb-8" style={{ color: "#888" }}>
          Your Verdict credit is ready. Head back to Crow&rsquo;s Eye and submit your screenshots to get your full analysis.
        </p>
        <Link
          href="/crows-eye"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition"
          style={{ background: "#00C2C7", color: "#0D1520" }}
        >
          Go to Crow&rsquo;s Eye →
        </Link>
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm transition"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
