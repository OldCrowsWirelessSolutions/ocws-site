// app/components/FAQPreview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const PREVIEW_FAQS = [
  {
    q: "What is Crow's Eye?",
    a: "Crow's Eye is an AI-powered wireless diagnostic tool built by Old Crows Wireless Solutions. You upload screenshots from a free Wi-Fi scanner app and Corvus — our RF intelligence engine — analyzes every network visible in your environment and tells you exactly what's wrong and how to fix it.",
  },
  {
    q: "What scanner app do I need?",
    a: "WiFi Analyzer open source — free, green icon, available on Google Play. iPhone users can use WiFi Analyzer by Zoltán Palághy from the App Store.",
  },
  {
    q: "How much does it cost?",
    a: "The initial analysis is free. Corvus will tell you how many problems he found and give you a preview. The full Verdict — all findings, all fixes, step-by-step router instructions specific to your equipment, and a branded PDF — is $50.",
  },
  {
    q: "Will this work for my business?",
    a: "Yes. Crow's Eye works for any environment — homes, restaurants, churches, offices, RV parks, marinas, schools, medical facilities. Corvus adjusts his analysis based on your environment type.",
  },
  {
    q: "What if I need more than a report?",
    a: "OCWS offers on-site RF assessments starting at $250 in the Pensacola metro area (Escambia and Santa Rosa Counties). $375 for locations in Northwest Florida through Mobile AL. Joshua Turner personally conducts and certifies every assessment.",
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
                    color: "#00C2C7",
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
          <Link href="/faq" className="text-sm font-semibold ocws-glow-hover rounded-lg px-2 py-1 -ml-2" style={{ color: "#00C2C7" }}>
            See all questions →
          </Link>
        </div>
      </div>
    </section>
  );
}
