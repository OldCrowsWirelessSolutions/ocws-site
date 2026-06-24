// app/api/admin/promo/generate/route.ts
export const runtime = "nodejs";

import { generatePromoCode, PromoType, PromoProduct, ExpiryType } from "@/lib/promo-codes";
import { isValidAdminKey, isValidDemoMintToken } from "@/lib/adminAuth";

const VALID_TYPES: PromoType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
  "sub_fledgling",
  "sub_nest",
  "sub_flock",
  "sub_murder",
  "sub_any",
  "demo",
];

const VALID_EXPIRY_TYPES: ExpiryType[] = [
  "single_use", "24h", "48h", "72h", "7d", "14d", "30d",
];

export async function POST(req: Request) {
  // Two credentials are accepted:
  //   - master admin secret  → may mint ANY code type (full power)
  //   - demo-mint token       → may mint ONLY type:'demo' giveaway codes
  // The demo token lets low-trust clients (the mobile app) mint demo codes
  // without holding the master secret, so rotating the master secret never
  // breaks app-side demo minting. See lib/adminAuth.ts.
  const presented = req.headers.get("x-admin-key");
  const isAdmin = isValidAdminKey(presented);
  const isDemoMinter = !isAdmin && isValidDemoMintToken(presented);
  if (!isAdmin && !isDemoMinter) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as {
      type?: string;
      products?: string;
      expiryType?: string;
      note?: string;
      expiresAt?: string;
      // For demo codes: custom suffix (e.g. "SMITH" → CORVUS-SMITH) and
      // the tier granted on redemption (nest / flock / murder).
      customSuffix?: string;
      tier?: string;
    };

    const type = (body.type as PromoType) ?? "verdict";
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: "Invalid type" }, { status: 400 });
    }

    // Scoped credential guard: the demo-mint token may ONLY produce demo codes.
    // Minting any paid-tier / subscription / reckoning code requires the master
    // admin secret.
    if (isDemoMinter && type !== "demo") {
      return Response.json(
        { error: "This token may only generate demo codes." },
        { status: 403 }
      );
    }

    // The actual entitlement is driven by `products`, so the demo-mint token
    // must be pinned to the demo product too — otherwise a caller could pass
    // type:'demo' but products:'sub_murder' and escalate to a subscription
    // grant. Force products:'demo' for demo-token callers regardless of input.
    const products: PromoProduct = isDemoMinter
      ? "demo"
      : ((body.products as PromoProduct) ?? (type as PromoProduct));
    const expiryType = VALID_EXPIRY_TYPES.includes(body.expiryType as ExpiryType)
      ? (body.expiryType as ExpiryType)
      : "single_use";

    const VALID_TIERS = ["nest", "flock", "murder"] as const;
    const tier = VALID_TIERS.includes(body.tier as typeof VALID_TIERS[number])
      ? (body.tier as "nest" | "flock" | "murder")
      : undefined;

    try {
      const code = await generatePromoCode(
        type,
        body.note ?? "",
        body.expiresAt,
        products,
        expiryType,
        body.customSuffix,
        tier,
      );
      return Response.json({ code });
    } catch (genErr) {
      // generatePromoCode throws on duplicate custom suffixes and invalid input.
      // Surface those messages to the admin UI so they can adjust.
      const msg = genErr instanceof Error ? genErr.message : "Failed to generate code";
      return Response.json({ error: msg }, { status: 400 });
    }
  } catch (err) {
    console.error("[admin/promo/generate]", err);
    return Response.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
