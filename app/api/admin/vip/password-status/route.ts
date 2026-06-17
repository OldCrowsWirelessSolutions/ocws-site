// app/api/admin/vip/password-status/route.ts
// Returns password set/unset status for all VIP founding codes.

export const runtime = "nodejs";

import redis from "@/lib/redis";
import { isValidAdminKey } from "@/lib/adminAuth";

const VIP_CODES = ["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"];

export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!isValidAdminKey(adminKey)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statuses: Record<string, boolean> = {};
  await Promise.all(
    VIP_CODES.map(async (code) => {
      try {
        const hash = await redis.get<string>(`vip:${code}:password_hash`);
        statuses[code] = !!hash;
      } catch {
        statuses[code] = false;
      }
    })
  );

  return Response.json({ statuses });
}
