// app/api/auth/check-tribute/route.ts
// Checks whether a tribute message has already been shown for a given code.
// Also performs monthly credit reset for lifetime members (CORVUS-KYLE).

export const runtime = "nodejs";

import redis from "@/lib/redis";
import { checkAndResetMonthlyCredits, isLifetimeCode } from "@/lib/lifetime-codes";

const TRIBUTE_CODES = new Set(["CORVUS-KYLE", "CORVUS-ERIC", "CORVUS-NATE", "CORVUS-MIKE"]);

export async function POST(req: Request) {
  let code: string;
  try {
    const body = await req.json() as { code?: string };
    code = String(body.code ?? "").trim().toUpperCase();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!TRIBUTE_CODES.has(code)) {
    return Response.json({ shown: true }); // Not a tribute code — skip
  }

  try {
    const shown = await redis.get(`tribute:${code}:shown`);

    // Monthly credit reset for lifetime Flock members
    if (isLifetimeCode(code)) {
      await checkAndResetMonthlyCredits(code);
    }

    return Response.json({ shown: !!shown });
  } catch {
    // Fail open — show tribute if Redis is unavailable
    return Response.json({ shown: false });
  }
}
