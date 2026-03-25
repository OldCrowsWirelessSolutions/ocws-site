// app/api/admin/codes/deactivate/route.ts
// Sets a subscription status to "cancelled", blocking further use.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { updateSubscription } from "@/lib/subscriptions";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json() as { subscription_id?: string };
    const id = String(body?.subscription_id ?? "").trim().toUpperCase();

    if (!id) {
      return Response.json({ error: "subscription_id required." }, { status: 400 });
    }

    const result = await updateSubscription(id, { status: "cancelled" });
    if (!result) {
      return Response.json({ error: "Subscription not found." }, { status: 404 });
    }

    return Response.json({ success: true, subscription_id: id });
  } catch (err) {
    console.error("[admin/codes/deactivate]", err);
    return Response.json({ error: "Deactivation failed." }, { status: 500 });
  }
}
