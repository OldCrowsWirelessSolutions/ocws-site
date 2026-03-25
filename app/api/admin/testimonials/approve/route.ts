// app/api/admin/testimonials/approve/route.ts
export const runtime = "nodejs";

import redis from "@/lib/redis";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

export async function POST(req: Request) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as { id?: string };
    const id = String(body?.id ?? "").trim();
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const record = await redis.get<Record<string, unknown>>(`testimonial:${id}`);
    if (!record) return Response.json({ error: "Not found" }, { status: 404 });

    // Update status
    await redis.set(`testimonial:${id}`, { ...record, status: "approved", approvedAt: new Date().toISOString() });

    // Move from pending list to approved list
    await redis.lrem("testimonials:pending", 0, id);
    await redis.lpush("testimonials:approved", id);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/testimonials/approve]", err);
    return Response.json({ error: "Failed to approve testimonial" }, { status: 500 });
  }
}
