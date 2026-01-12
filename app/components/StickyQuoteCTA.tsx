// app/components/StickyQuoteCTA.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyQuoteCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after a small scroll so it doesn’t fight the hero/header
      setShow(window.scrollY > 220);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed right-5 bottom-5 z-[60]">
      <Link
        href="/request-quote"
        className="ocws-tile ocws-tile-hover inline-flex items-center gap-2 px-4 py-3"
        aria-label="Request a Quote"
      >
        <span className="text-sm font-semibold text-white">Request a Quote</span>
        <span
          className="inline-flex h-2 w-2 rounded-full"
          style={{ background: "var(--ocws-cyan)" }}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
