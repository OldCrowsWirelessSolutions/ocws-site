// app/api/admin/testimonials/deny/route.ts
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

    await redis.lrem("testimonials:pending", 0, id);
    await redis.del(`testimonial:${id}`);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/testimonials/deny]", err);
    return Response.json({ error: "Failed to deny testimonial" }, { status: 500 });
  }
}
