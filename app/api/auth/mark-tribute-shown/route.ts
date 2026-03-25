// app/api/auth/mark-tribute-shown/route.ts
// Sets the Redis flag that prevents a tribute from showing again.
// Called when the user clicks "Continue to Dashboard →".

export const runtime = "nodejs";

import redis from "@/lib/redis";

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
    return Response.json({ ok: false });
  }

  try {
    await redis.set(`tribute:${code}:shown`, "true");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
