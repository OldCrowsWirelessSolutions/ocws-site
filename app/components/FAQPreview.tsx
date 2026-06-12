// app/components/FAQPreview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const PREVIEW_FAQS = [
  {
    q: "What is Crow's Eye?",
    a: "Crow's Eye is an AI-powered wireless diagnostics app built on 17 years of U.S. Navy Electronic Warfare experience. Download it on Android, let Corvus scan your network automatically, and get a full WiFi Health Report — findings and fix steps — in minutes.",
  },
  {
    q: "What is a WiFi Health Report?",
    a: "A WiFi Health Report is Corvus's AI-generated analysis of your wireless environment. It identifies channel conflicts, security gaps, coverage issues, and interference patterns — then delivers prioritized fix steps with manufacturer-specific instructions.",
  },
  {
    q: "How much does it cost?",
    a: "Fledgling tier is $10/month and includes 3 WiFi Health Reports. A single WiFi Health Report is $50 with no subscription required. Nest ($20/mo) includes 3 WiFi Health Reports per month. See all plans on the Pricing page.",
  },
  {
    q: "What devices does it work on?",
    a: "Android phones and tablets running Android 10 or higher. iOS is coming soon.",
  },
  {
    q: "Will this work for my business?",
    a: "Yes. Crow's Eye works for any environment — homes, restaurants, churches, offices, RV parks, marinas, schools, medical facilities. Corvus adjusts his analysis based on your environment type.",
  },
];

export default function FAQPreview() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20" style={{ background: "#1A2332" }}>
      <div className="ocws-container">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">Common questions.</h2>

        <div className="space-y-3">
          {PREVIEW_FAQS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden ocws-card-glow"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-white font-semibold text-sm pr-4">{item.q}</span>
                <svg
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)",
                    color: "#22D6DC",
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#aaa" }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/faq" className="text-sm font-semibold ocws-glow-hover rounded-lg px-2 py-1 -ml-2" style={{ color: "#22D6DC" }}>
            See all questions →
          </Link>
        </div>
      </div>
    </section>
  );
}
