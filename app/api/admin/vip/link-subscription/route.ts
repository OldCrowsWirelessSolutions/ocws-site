// app/api/admin/vip/link-subscription/route.ts
// Links an institutional subscription to a VIP — their reports flow into VIP Team Activity.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, linkSubscriptionToVIP, getLinkedSubscriptions } from "@/lib/vip-codes";
import { getSubscription } from "@/lib/subscriptions";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body           = await req.json() as { vipCode?: string; subscriptionId?: string };
    const vipCode        = String(body?.vipCode ?? "").trim().toUpperCase();
    const subscriptionId = String(body?.subscriptionId ?? "").trim().toUpperCase();

    if (!vipCode)        return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!subscriptionId) return NextResponse.json({ error: "Subscription ID required" }, { status: 400 });
    if (!isVIPCode(vipCode)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 400 });

    const sub = await getSubscription(subscriptionId);
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    await linkSubscriptionToVIP(vipCode, subscriptionId);

    const linked = await getLinkedSubscriptions(vipCode);
    return NextResponse.json({ linked: true, linkedSubscriptions: linked });
  } catch (err) {
    console.error("[admin/vip/link-subscription]", err);
    return NextResponse.json({ error: "Failed to link subscription" }, { status: 500 });
  }
}
