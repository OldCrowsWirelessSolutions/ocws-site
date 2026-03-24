// lib/env-check.ts
// Startup environment variable validation.
// Call checkEnv() in any server-side module that needs a clean set of vars.
// Does NOT throw — logs warnings so the app boots and reports problems clearly.
// Do NOT import this in client components (server-only).

type EnvVar = {
  key: string;
  required: boolean;
  description: string;
  redact?: boolean;   // true = never log the value
};

const ENV_VARS: EnvVar[] = [
  // ── Redis (subscription storage) ──────────────────────────────────────────
  { key: "UPSTASH_REDIS_REST_URL",   required: true,  description: "Upstash Redis REST endpoint",       redact: false },
  { key: "UPSTASH_REDIS_REST_TOKEN", required: true,  description: "Upstash Redis REST token",          redact: true  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  { key: "OCWS_ADMIN_SECRET",        required: true,  description: "Admin secret for /api/subscriptions/seed", redact: true },

  // ── Stripe ────────────────────────────────────────────────────────────────
  { key: "STRIPE_SECRET_KEY",        required: true,  description: "Stripe secret key (sk_live_...)",   redact: true  },
  { key: "STRIPE_WEBHOOK_SECRET",    required: true,  description: "Stripe webhook signing secret",     redact: true  },
  { key: "STRIPE_PRICE_VERDICT",             required: false, description: "Stripe Price ID — Corvus' Verdict"          },
  { key: "STRIPE_PRICE_RECKONING_SMALL",     required: false, description: "Stripe Price ID — Full Reckoning Small"      },
  { key: "STRIPE_PRICE_RECKONING_STANDARD",  required: false, description: "Stripe Price ID — Full Reckoning Standard"   },
  { key: "STRIPE_PRICE_RECKONING_COMMERCIAL",required: false, description: "Stripe Price ID — Full Reckoning Commercial" },
  { key: "STRIPE_PRICE_PRO_CERTIFIED",       required: false, description: "Stripe Price ID — Pro Certified Reckoning"   },
  { key: "STRIPE_PRICE_CREDIT_SINGLE",       required: false, description: "Stripe Price ID — Verdict credit single"     },
  { key: "STRIPE_PRICE_CREDIT_6PACK",        required: false, description: "Stripe Price ID — Verdict credit 6-pack"     },
  { key: "STRIPE_PRICE_CREDIT_12PACK",       required: false, description: "Stripe Price ID — Verdict credit 12-pack"    },
  { key: "STRIPE_PRICE_NEST_MONTHLY",        required: false, description: "Stripe Price ID — Nest monthly"              },
  { key: "STRIPE_PRICE_NEST_ANNUAL",         required: false, description: "Stripe Price ID — Nest annual"               },
  { key: "STRIPE_PRICE_FLOCK_MONTHLY",       required: false, description: "Stripe Price ID — Flock monthly"             },
  { key: "STRIPE_PRICE_FLOCK_ANNUAL",        required: false, description: "Stripe Price ID — Flock annual"              },
  { key: "STRIPE_PRICE_MURDER_MONTHLY",      required: false, description: "Stripe Price ID — Murder monthly"            },
  { key: "STRIPE_PRICE_MURDER_ANNUAL",       required: false, description: "Stripe Price ID — Murder annual"             },

  // ── Subscriber-specific pricing (PRICE_* env vars for price-map.ts) ────────
  { key: "PRICE_CORVUS_VERDICT",            required: false, description: "Price map — Corvus' Verdict"                  },
  { key: "PRICE_RECKONING_SMALL",           required: false, description: "Price map — Reckoning Small (public)"         },
  { key: "PRICE_RECKONING_STANDARD",        required: false, description: "Price map — Reckoning Standard (public)"      },
  { key: "PRICE_RECKONING_COMMERCIAL",      required: false, description: "Price map — Reckoning Commercial (public)"    },
  { key: "PRICE_OCWS_PRO",                  required: false, description: "Price map — OCWS Pro"                         },
  { key: "PRICE_EXTRA_CREDIT",              required: false, description: "Price map — Extra credit (single)"            },
  { key: "PRICE_VERDICT_6PACK",             required: false, description: "Price map — Verdict 6-pack"                   },
  { key: "PRICE_VERDICT_12PACK",            required: false, description: "Price map — Verdict 12-pack"                  },
  { key: "PRICE_RECKONING_SMALL_NEST",      required: false, description: "Price map — Reckoning Small (Nest rate)"      },
  { key: "PRICE_EXTRA_CREDIT_FLOCK",        required: false, description: "Price map — Extra credit (Flock rate)"        },
  { key: "PRICE_VERDICT_6PACK_FLOCK",       required: false, description: "Price map — Verdict 6-pack (Flock rate)"      },
  { key: "PRICE_VERDICT_12PACK_FLOCK",      required: false, description: "Price map — Verdict 12-pack (Flock rate)"     },
  { key: "PRICE_RECKONING_SMALL_FLOCK",     required: false, description: "Price map — Reckoning Small (Flock rate)"     },
  { key: "PRICE_RECKONING_STANDARD_FLOCK",  required: false, description: "Price map — Reckoning Standard (Flock rate)"  },
  { key: "PRICE_RECKONING_COMMERCIAL_FLOCK",required: false, description: "Price map — Reckoning Commercial (Flock rate)"},

  // ── SMTP ──────────────────────────────────────────────────────────────────
  { key: "SMTP_FROM",  required: true,  description: "SMTP sender address"  },
  { key: "SMTP_HOST",  required: true,  description: "SMTP server hostname" },
  { key: "SMTP_PORT",  required: false, description: "SMTP port (default 587)" },
  { key: "SMTP_USER",  required: true,  description: "SMTP username",  redact: true },
  { key: "SMTP_PASS",  required: true,  description: "SMTP password",  redact: true },

  // ── Google Sheets ─────────────────────────────────────────────────────────
  { key: "GOOGLE_CLIENT_EMAIL", required: false, description: "Google service account email" },
  { key: "GOOGLE_PRIVATE_KEY",  required: false, description: "Google service account private key", redact: true },
  { key: "GOOGLE_SHEET_ID",     required: false, description: "Google Sheets ID for waitlist" },

  // ── Contact routing ───────────────────────────────────────────────────────
  { key: "OCWS_CONTACT_TO", required: false, description: "BCC / notification recipient email (default: joshua@oldcrowswireless.com)" },
];

let checked = false;

export function checkEnv(): void {
  if (checked) return;
  checked = true;

  const missing: string[] = [];
  const placeholder: string[] = [];

  for (const v of ENV_VARS) {
    const val = process.env[v.key];
    if (!val) {
      if (v.required) missing.push(v.key);
      continue;
    }
    // Flag obvious placeholders
    if (val.includes("REPLACE") || val === "undefined" || val === "null") {
      placeholder.push(v.key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[env-check] MISSING required environment variables:\n` +
      missing.map((k) => {
        const desc = ENV_VARS.find((v) => v.key === k)?.description ?? "";
        return `  ✗ ${k}  — ${desc}`;
      }).join("\n")
    );
  }

  if (placeholder.length > 0) {
    console.warn(
      `[env-check] Environment variables with placeholder values (replace before production):\n` +
      placeholder.map((k) => `  ⚠ ${k}`).join("\n")
    );
  }

  if (missing.length === 0 && placeholder.length === 0) {
    console.log("[env-check] All required environment variables are set.");
  }
}

// Typed accessor — throws at call site if a required var is not set.
// Use for vars that must be present for a specific operation.
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[env-check] Required environment variable ${key} is not set.`);
  return val;
}
