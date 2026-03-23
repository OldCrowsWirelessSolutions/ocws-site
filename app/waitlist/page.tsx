// app/waitlist/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Waitlist | Old Crows Wireless Solutions",
  description: "You're on the Crow's Eye waitlist. Corvus will be in touch.",
};

export default function WaitlistPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-20 text-center">
        <p className="text-6xl mb-6">🐦‍⬛</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          You&rsquo;re on the list.
        </h1>
        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "#888" }}>
          Corvus will be in touch when your tier launches.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition"
          style={{ background: "#00C2C7", color: "#0D1520" }}
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
