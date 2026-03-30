export const runtime = "nodejs";
import redis from "@/lib/redis";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_KEY || "SpectrumLife2026!!";

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key") ?? "";
  if (key !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Get all promo keys
    const keys = await redis.keys("promo:*") as string[];
    let cleared = 0;
    for (const k of keys) {
      if (k.includes(':index') || k.includes(':list')) continue;
      const record = await redis.get<{ active?: boolean; usedAt?: string }>(k);
      if (record && record.active === false) {
        await redis.del(k);
        cleared++;
      }
    }
    // Also clean up the promo index list
    const indexKey = "promo:index";
    const indexType = await redis.type(indexKey);
    if (indexType === 'list') {
      const allCodes = await redis.lrange<string>(indexKey, 0, -1);
      const remaining = [];
      for (const code of allCodes) {
        const record = await redis.get<{ active?: boolean }>(`promo:${code}`);
        if (record && record.active !== false) remaining.push(code);
      }
      await redis.del(indexKey);
      if (remaining.length > 0) {
        await redis.rpush(indexKey, ...remaining);
      }
    }
    return Response.json({ success: true, cleared });
  } catch (err) {
    console.error('[promo/clear-deactivated]', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
