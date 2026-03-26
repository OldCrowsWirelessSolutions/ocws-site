// lib/price-map.ts
// Complete Stripe price ID map, tier entitlements, and pricing tables.
// All price IDs come from environment variables — never hardcoded.
// Server-side only. Do not import in client components.

// ─── Full price map ───────────────────────────────────────────────────────────

export const PRICE_MAP = {
  // Public one-time
  CORVUS_VERDICT:             process.env.PRICE_CORVUS_VERDICT!,
  RECKONING_SMALL:            process.env.PRICE_RECKONING_SMALL!,
  RECKONING_STANDARD:         process.env.PRICE_RECKONING_STANDARD!,
  RECKONING_COMMERCIAL:       process.env.PRICE_RECKONING_COMMERCIAL!,
  OCWS_PRO:                   process.env.PRICE_OCWS_PRO!,
  EXTRA_CREDIT:               process.env.PRICE_EXTRA_CREDIT!,
  VERDICT_6PACK:              process.env.PRICE_VERDICT_6PACK!,
  VERDICT_12PACK:             process.env.PRICE_VERDICT_12PACK!,

  // Subscriptions
  FLEDGLING_MONTHLY:          process.env.PRICE_FLEDGLING_MONTHLY!,
  FLEDGLING_ANNUAL:           process.env.PRICE_FLEDGLING_ANNUAL!,
  NEST_MONTHLY:               process.env.PRICE_NEST_MONTHLY!,
  NEST_ANNUAL:                process.env.PRICE_NEST_ANNUAL!,
  FLOCK_MONTHLY:              process.env.PRICE_FLOCK_MONTHLY!,
  FLOCK_ANNUAL:               process.env.PRICE_FLOCK_ANNUAL!,
  MURDER_MONTHLY:             process.env.PRICE_MURDER_MONTHLY!,
  MURDER_ANNUAL:              process.env.PRICE_MURDER_ANNUAL!,
  FLOCK_TEAM_LEAD_MONTHLY:    process.env.PRICE_FLOCK_TEAM_LEAD_MONTHLY!,
  FLOCK_TEAM_LEAD_ANNUAL:     process.env.PRICE_FLOCK_TEAM_LEAD_ANNUAL!,

  // Nest subscriber rates (credits reuse public pricing; reckoning is discounted)
  EXTRA_CREDIT_NEST:          process.env.PRICE_EXTRA_CREDIT!,
  VERDICT_6PACK_NEST:         process.env.PRICE_VERDICT_6PACK!,
  VERDICT_12PACK_NEST:        process.env.PRICE_VERDICT_12PACK!,
  RECKONING_SMALL_NEST:       process.env.PRICE_RECKONING_SMALL_NEST!,

  // Flock subscriber rates (discounted across the board)
  EXTRA_CREDIT_FLOCK:         process.env.PRICE_EXTRA_CREDIT_FLOCK!,
  VERDICT_6PACK_FLOCK:        process.env.PRICE_VERDICT_6PACK_FLOCK!,
  VERDICT_12PACK_FLOCK:       process.env.PRICE_VERDICT_12PACK_FLOCK!,
  RECKONING_SMALL_FLOCK:      process.env.PRICE_RECKONING_SMALL_FLOCK!,
  RECKONING_STANDARD_FLOCK:   process.env.PRICE_RECKONING_STANDARD_FLOCK!,
  RECKONING_COMMERCIAL_FLOCK: process.env.PRICE_RECKONING_COMMERCIAL_FLOCK!,
};

// ─── Subscription price IDs for checkout mode detection ──────────────────────

export const SUBSCRIPTION_PRICE_IDS = [
  process.env.PRICE_FLEDGLING_MONTHLY!,
  process.env.PRICE_FLEDGLING_ANNUAL!,
  process.env.PRICE_NEST_MONTHLY!,
  process.env.PRICE_NEST_ANNUAL!,
  process.env.PRICE_FLOCK_MONTHLY!,
  process.env.PRICE_FLOCK_ANNUAL!,
  process.env.PRICE_MURDER_MONTHLY!,
  process.env.PRICE_MURDER_ANNUAL!,
  process.env.PRICE_FLOCK_TEAM_LEAD_MONTHLY!,
  process.env.PRICE_FLOCK_TEAM_LEAD_ANNUAL!,
];

// ─── Credits awarded per price ID (for webhook credit fulfillment) ────────────

function buildCreditsByPrice(): Record<string, number> {
  const m: Record<string, number> = {};
  const add = (id: string | undefined, n: number) => { if (id) m[id] = n; };
  add(process.env.PRICE_EXTRA_CREDIT,       1);
  add(process.env.PRICE_VERDICT_6PACK,      6);
  add(process.env.PRICE_VERDICT_12PACK,     12);
  add(process.env.PRICE_EXTRA_CREDIT_FLOCK, 1);
  add(process.env.PRICE_VERDICT_6PACK_FLOCK,  6);
  add(process.env.PRICE_VERDICT_12PACK_FLOCK, 12);
  return m;
}
export const CREDITS_BY_PRICE: Record<string, number> = buildCreditsByPrice();

// ─── Monthly credits by tier ──────────────────────────────────────────────────

export const MONTHLY_CREDITS: Record<string, number> = {
  fledgling: 0,
  nest:      3,
  flock:     15,
  murder:    999999,
};

// ─── Seats by tier ────────────────────────────────────────────────────────────

export const TIER_SEATS: Record<string, number> = {
  fledgling: 1,
  nest:      1,
  flock:     5,
  murder:    15,
};

// ─── Seat add-on prices ───────────────────────────────────────────────────────

export const FLOCK_SEAT_PRICES: Record<number, { monthly: string; annual: string; monthlyPrice: number; annualPrice: number }> = {
  1: { monthly: process.env.PRICE_FLOCK_SEAT_1_MONTHLY!, annual: process.env.PRICE_FLOCK_SEAT_1_ANNUAL!, monthlyPrice: 25,  annualPrice: 240 },
  2: { monthly: process.env.PRICE_FLOCK_SEAT_2_MONTHLY!, annual: process.env.PRICE_FLOCK_SEAT_2_ANNUAL!, monthlyPrice: 45,  annualPrice: 432 },
  3: { monthly: process.env.PRICE_FLOCK_SEAT_3_MONTHLY!, annual: process.env.PRICE_FLOCK_SEAT_3_ANNUAL!, monthlyPrice: 60,  annualPrice: 576 },
  4: { monthly: process.env.PRICE_FLOCK_SEAT_4_MONTHLY!, annual: process.env.PRICE_FLOCK_SEAT_4_ANNUAL!, monthlyPrice: 75,  annualPrice: 720 },
};

export const MURDER_SEAT_PRICES: Record<number, { monthly: string; annual: string; monthlyPrice: number; annualPrice: number }> = {
  1:  { monthly: process.env.PRICE_MURDER_SEAT_1_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_1_ANNUAL!,  monthlyPrice: 75,  annualPrice: 720  },
  2:  { monthly: process.env.PRICE_MURDER_SEAT_2_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_2_ANNUAL!,  monthlyPrice: 140, annualPrice: 1344 },
  3:  { monthly: process.env.PRICE_MURDER_SEAT_3_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_3_ANNUAL!,  monthlyPrice: 195, annualPrice: 1872 },
  4:  { monthly: process.env.PRICE_MURDER_SEAT_4_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_4_ANNUAL!,  monthlyPrice: 240, annualPrice: 2304 },
  5:  { monthly: process.env.PRICE_MURDER_SEAT_5_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_5_ANNUAL!,  monthlyPrice: 275, annualPrice: 2640 },
  6:  { monthly: process.env.PRICE_MURDER_SEAT_6_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_6_ANNUAL!,  monthlyPrice: 300, annualPrice: 2880 },
  7:  { monthly: process.env.PRICE_MURDER_SEAT_7_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_7_ANNUAL!,  monthlyPrice: 315, annualPrice: 3024 },
  8:  { monthly: process.env.PRICE_MURDER_SEAT_8_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_8_ANNUAL!,  monthlyPrice: 320, annualPrice: 3072 },
  9:  { monthly: process.env.PRICE_MURDER_SEAT_9_MONTHLY!,  annual: process.env.PRICE_MURDER_SEAT_9_ANNUAL!,  monthlyPrice: 325, annualPrice: 3120 },
  10: { monthly: process.env.PRICE_MURDER_SEAT_10_MONTHLY!, annual: process.env.PRICE_MURDER_SEAT_10_ANNUAL!, monthlyPrice: 330, annualPrice: 3168 },
};

// ─── Seat rules by tier ───────────────────────────────────────────────────────

export const SEAT_RULES: Record<string, { included: number; maxAdditional: number; maxTotal: number; upgradeRequired: string | null }> = {
  nest:   { included: 1, maxAdditional: 0,  maxTotal: 1,  upgradeRequired: "flock"  },
  flock:  { included: 1, maxAdditional: 4,  maxTotal: 5,  upgradeRequired: "murder" },
  murder: { included: 5, maxAdditional: 10, maxTotal: 15, upgradeRequired: null     },
};

// ─── Flock Team Lead add-on pricing ──────────────────────────────────────────

export const FLOCK_TEAM_LEAD_PRICING = {
  monthly: { priceId: process.env.PRICE_FLOCK_TEAM_LEAD_MONTHLY!, price: 35 },
  annual:  { priceId: process.env.PRICE_FLOCK_TEAM_LEAD_ANNUAL!,  price: 300 },
};

// ─── All seat price IDs (for subscription mode detection) ────────────────────

export const SEAT_PRICE_IDS: string[] = [
  ...Object.values(FLOCK_SEAT_PRICES).flatMap(p => [p.monthly, p.annual].filter(Boolean)),
  ...Object.values(MURDER_SEAT_PRICES).flatMap(p => [p.monthly, p.annual].filter(Boolean)),
];

// ─── Credit pricing by tier ──────────────────────────────────────────────────

export const CREDIT_PRICING: Record<string, {
  single: string;       singlePrice: number;
  sixPack: string;      sixPackPrice: number;
  twelvePack: string;   twelvePackPrice: number;
}> = {
  nest: {
    single:         process.env.PRICE_EXTRA_CREDIT!,
    singlePrice:    15,
    sixPack:        process.env.PRICE_VERDICT_6PACK!,
    sixPackPrice:   75,
    twelvePack:     process.env.PRICE_VERDICT_12PACK!,
    twelvePackPrice: 120,
  },
  flock: {
    single:         process.env.PRICE_EXTRA_CREDIT_FLOCK!,
    singlePrice:    10,
    sixPack:        process.env.PRICE_VERDICT_6PACK_FLOCK!,
    sixPackPrice:   50,
    twelvePack:     process.env.PRICE_VERDICT_12PACK_FLOCK!,
    twelvePackPrice: 90,
  },
  murder: {
    single:         "",
    singlePrice:    0,
    sixPack:        "",
    sixPackPrice:   0,
    twelvePack:     "",
    twelvePackPrice: 0,
  },
};

// ─── Reckoning pricing by tier ────────────────────────────────────────────────

export const RECKONING_PRICING: Record<string, {
  small?:      string; smallPrice?:      number;
  standard?:   string; standardPrice?:   number;
  commercial?: string; commercialPrice?: number;
}> = {
  public: {
    small:          process.env.PRICE_RECKONING_SMALL!,
    smallPrice:     150,
    standard:       process.env.PRICE_RECKONING_STANDARD!,
    standardPrice:  350,
    commercial:     process.env.PRICE_RECKONING_COMMERCIAL!,
    commercialPrice: 750,
  },
  nest: {
    small:          process.env.PRICE_RECKONING_SMALL_NEST!,
    smallPrice:     50,
  },
  flock: {
    small:          process.env.PRICE_RECKONING_SMALL_FLOCK!,
    smallPrice:     35,
    standard:       process.env.PRICE_RECKONING_STANDARD_FLOCK!,
    standardPrice:  75,
    commercial:     process.env.PRICE_RECKONING_COMMERCIAL_FLOCK!,
    commercialPrice: 200,
  },
  murder: {},
};
