// app/api/admin/testimonials/pending/route.ts
export const runtime = "nodejs";

import redis from "@/lib/redis";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

export async function GET(req: Request) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const ids = await redis.lrange("testimonials:pending", 0, -1) as string[];
    if (!ids.length) return Response.json({ testimonials: [] });
    const records = await Promise.all(ids.map((id) => redis.get(`testimonial:${id}`)));
    const testimonials = records.filter(Boolean);
    return Response.json({ testimonials });
  } catch (err) {
    console.error("[admin/testimonials/pending]", err);
    return Response.json({ error: "Failed to load testimonials" }, { status: 500 });
  }
}
