// app/components/LocalBusinessSchema.tsx
export default function LocalBusinessSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Old Crows Wireless Solutions",
    alternateName: "OCWS",
    description:
      "Old Crows Wireless Solutions (OCWS) is based in Pensacola, Florida—providing RF diagnostics, interference hunting, validation, and wireless assessment services across residential and enterprise environments.",
    areaServed: [
      {
        "@type": "City",
        name: "Pensacola",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Pensacola",
          addressRegion: "FL",
          addressCountry: "US",
        },
      },
      {
        "@type": "AdministrativeArea",
        name: "Northwest Florida",
        address: {
          "@type": "PostalAddress",
          addressRegion: "FL",
          addressCountry: "US",
        },
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pensacola",
      addressRegion: "FL",
      addressCountry: "US",
    },
    url: "https://oldcrowswireless.com",
    telephone: "+1-850-861-7582",
    brand: {
      "@type": "Brand",
      name: "Old Crows Wireless Solutions",
    },
    sameAs: [
      // Add your real links later (Google Business Profile, LinkedIn, etc.)
    ],
    knowsAbout: [
      "RF optimization",
      "Wireless assessment",
      "Wi-Fi diagnostics",
      "Radio frequency interference hunting",
      "Post-installation validation",
      "In-building cellular survey support",
      "Public safety communications survey support",
    ],
    serviceType: [
      "Premium Home & Home Office RF Optimization",
      "Enterprise & Facilities RF Assessment",
      "Radio Frequency Interference (RFI) Hunting",
      "Post-Installation Validation",
      "Cellular / DAS Design & Survey Support",
      "Public Safety (P25) Network Survey",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
