// app/endorsements/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getApprovedEndorsements } from "@/lib/endorsements";

export const metadata = {
  title: "Endorsements — Old Crows Wireless Solutions",
  description: "Professional endorsements from IT leaders, CISOs, and enterprise professionals who have seen Corvus in action.",
};

export default function EndorsementsPage() {
  const endorsements = getApprovedEndorsements();

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "#D8AC32", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "12px" }}>
          Professional Endorsements
        </p>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#F4F6F8", marginBottom: "12px" }}>
          Trusted by Professionals
        </h1>
        <p style={{ fontSize: "1rem", color: "#888888", maxWidth: "560px", margin: "0 auto" }}>
          The people who have seen what Corvus can do — and choose to put their name behind it.
        </p>
      </div>

      {/* Cards */}
      {endorsements.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {endorsements.map((e) => {
            const initials = e.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div
                key={e.id}
                style={{
                  background: "#1A2332",
                  border: `1px solid ${(e as { featured?: boolean }).featured ? "rgba(216,172,50,0.4)" : "rgba(34,214,220,0.15)"}`,
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: (e as { featured?: boolean }).featured ? "0 0 40px rgba(216,172,50,0.06)" : "none",
                }}
              >
                {/* Person header */}
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    border: "2px solid #D8AC32", overflow: "hidden", flexShrink: 0,
                  }}>
                    {e.photoUrl ? (
                      <Image
                        src={e.photoUrl}
                        alt={e.name}
                        width={80}
                        height={80}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: "rgba(216,172,50,0.15)",
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: "1.4rem", color: "#D8AC32",
                      }}>
                        {initials}
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F4F6F8" }}>{e.name}</span>
                      {e.linkedinUrl && (
                        <a
                          href={e.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${e.name} on LinkedIn`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            fontFamily: "'Share Tech Mono', monospace", fontSize: "0.58rem",
                            color: "#22D6DC", textDecoration: "none", letterSpacing: "0.08em",
                            border: "1px solid rgba(34,214,220,0.25)", borderRadius: "4px",
                            padding: "3px 8px", transition: "all 0.2s",
                          }}
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#22D6DC", fontWeight: 600, marginBottom: "2px" }}>{e.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "#888888", marginBottom: "2px" }}>{e.company}</div>
                    {(e as { location?: string }).location && (
                      <div style={{ fontSize: "0.75rem", color: "#666666" }}>{(e as { location?: string }).location}</div>
                    )}
                  </div>
                </div>

                {/* Quotes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {e.quotes && e.quotes.length > 0 ? (
                    e.quotes.map(q => (
                      <div key={q.id} style={{ borderLeft: "3px solid #D8AC32", paddingLeft: "16px" }}>
                        <div style={{
                          fontFamily: "'Share Tech Mono', monospace", fontSize: "0.58rem",
                          color: "#D8AC32", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px",
                        }}>
                          {q.label}
                        </div>
                        <blockquote style={{
                          margin: 0, fontStyle: "italic", fontSize: "0.9rem",
                          color: "rgba(244,246,248,0.85)", lineHeight: 1.8,
                        }}>
                          &ldquo;{q.text}&rdquo;
                        </blockquote>
                      </div>
                    ))
                  ) : (
                    <div style={{ borderLeft: "3px solid #D8AC32", paddingLeft: "16px" }}>
                      <blockquote style={{
                        margin: 0, fontStyle: "italic", fontSize: "0.9rem",
                        color: "rgba(244,246,248,0.85)", lineHeight: 1.8,
                      }}>
                        &ldquo;{e.quote}&rdquo;
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "48px", textAlign: "center",
        }}>
          <p style={{ color: "#888888", fontSize: "1rem" }}>Endorsements are coming soon.</p>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <a
          href="/crows-eye"
          style={{
            display: "inline-block", padding: "14px 32px",
            background: "rgba(34,214,220,0.1)", border: "1px solid rgba(34,214,220,0.3)",
            borderRadius: "10px", color: "#22D6DC",
            fontFamily: "'Share Tech Mono', monospace", fontSize: "0.8rem",
            letterSpacing: "0.1em", textDecoration: "none",
          }}
        >
          Get Your WiFi Health Report — Free →
        </a>
      </div>

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link href="/" style={{ color: "#555555", fontSize: "0.82rem" }}>
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}
