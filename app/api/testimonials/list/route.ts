// app/api/testimonials/list/route.ts
// Public endpoint — returns all approved testimonials ordered by most recent first.
export const runtime = "nodejs";

import redis from "@/lib/redis";

export async function GET() {
  try {
    const ids = await redis.lrange("testimonials:approved", 0, -1) as string[];
    if (!ids.length) return Response.json({ testimonials: [] });
    const records = await Promise.all(ids.map((id) => redis.get(`testimonial:${id}`)));
    const testimonials = records.filter(Boolean);
    return Response.json({ testimonials });
  } catch (err) {
    console.error("[testimonials/list]", err);
    return Response.json({ testimonials: [] });
  }
}
