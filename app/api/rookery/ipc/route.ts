// Rookery brain — single RPC endpoint. The web Rookery (Expo WebView / browser)
// calls this via webBridge: POST { channel, args } -> { result } | { error }.
//
// Auth: the caller's Rookery code arrives via the `x-corvus-code` header (or a
// `code` field in the body). It's resolved to an account and passed as the
// dispatch context, so authz.enforce() can tenant-scope every query. Anonymous
// callers may only run PUBLIC channels (catalog/health); everything else 401s
// inside dispatch via the authz layer.
//
// SAFETY: still gated behind ROOKERY_IPC_ENABLED (503 when unset) until Josh
// confirms the account↔owner identity model and flips it on per environment.
export const runtime = "nodejs";

import { dispatch, type DispatchContext } from "@/lib/rookery/dispatch";
import { getAccountByCode } from "@/lib/accounts";
import { isValidAdminKey } from "@/lib/adminAuth";

const FOUNDING_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);
const FOUNDER_CODE = "OCWS-CORVUS-FOUNDER-JOSHUA";

/** Resolve a raw Rookery code into a dispatch context (null account = anonymous). */
async function resolveContext(rawCode: string | null): Promise<DispatchContext> {
  const raw = (rawCode ?? "").trim();
  if (!raw) return { account: null };
  const code = raw.toUpperCase();

  // Admin login matches the rest of the OCWS apps: username "Admin" + the admin
  // password, where the password === OCWS_ADMIN_SECRET (validated constant-time
  // by lib/adminAuth). The client persists + sends that secret as x-corvus-code.
  const viaSecret = isValidAdminKey(raw);
  const account = await getAccountByCode(code).catch(() => null);
  const isAdmin =
    code === FOUNDER_CODE ||
    FOUNDING_CODES.has(code) ||
    viaSecret ||
    account?.tier === "admin";

  if (!account && !isAdmin) return { account: null }; // unknown code → anonymous
  return {
    account: {
      // Never echo the raw secret back as the code — label admin-via-secret "ADMIN".
      code: viaSecret ? "ADMIN" : code,
      email: account?.email ?? null,
      isAdmin,
      tier: account?.tier ?? (isAdmin ? "admin" : "nest"),
      eduProducts: account?.eduProducts ?? null
    }
  };
}

// ---- CORS ----
// The web Rookery is served from a different origin (EAS Hosting *.expo.app, or
// rookery*.oldcrowswireless.com) than this API, so the WebView/browser enforces
// CORS. Echo the request Origin when it's allowed (credentials require an exact
// origin, never "*"). Extra origins can be added via ROOKERY_WEB_ORIGIN (CSV).
function allowedOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const env = (process.env.ROOKERY_WEB_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (env.includes(origin)) return origin;
  try {
    const h = new URL(origin).hostname;
    if (h.endsWith(".expo.app") || h.endsWith(".oldcrowswireless.com") || h === "localhost") {
      return origin;
    }
  } catch {
    /* malformed origin */
  }
  return null;
}

function cors(req: Request): Record<string, string> {
  const o = allowedOrigin(req);
  if (!o) return {};
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-corvus-code",
    Vary: "Origin"
  };
}

function jsonRes(req: Request, data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: cors(req) });
}

/** CORS preflight for the cross-origin web Rookery. */
export async function OPTIONS(req: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  // Enabled by default for the Rookery beta (2026-06-27). Set the env var
  // ROOKERY_IPC_ENABLED="false" to kill-switch it without a code change.
  if (process.env.ROOKERY_IPC_ENABLED === "false") {
    return jsonRes(req, { error: "Rookery IPC is disabled" }, 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRes(req, { error: "Invalid JSON body" }, 400);
  }

  const { channel, args, code } = (body ?? {}) as { channel?: unknown; args?: unknown; code?: unknown };
  if (typeof channel !== "string") {
    return jsonRes(req, { error: "Missing 'channel'" }, 400);
  }

  const rawCode = req.headers.get("x-corvus-code") ?? (typeof code === "string" ? code : null);
  const ctx = await resolveContext(rawCode);

  try {
    const result = await dispatch(channel, Array.isArray(args) ? args : [], ctx);
    return jsonRes(req, { result });
  } catch (e) {
    const msg = (e as Error).message;
    // Chat pool exhausted → 402 (show buy-more / upgrade); rate-limit → 429 (back
    // off); authorization → 403; other handler errors → 200 with { error } (the
    // existing contract the renderer relies on).
    if (/out of corvus questions|free corvus questions|sign in to chat|month's corvus chat|field credits|create a field deliverable/i.test(msg)) {
      return jsonRes(req, { error: msg }, 402);
    }
    if (/rate limit reached/i.test(msg)) {
      return jsonRes(req, { error: msg }, 429);
    }
    const isAuthz = /required|not your|not permitted|admin only|cannot create/i.test(msg);
    return jsonRes(req, { error: msg }, isAuthz ? 403 : 200);
  }
}
