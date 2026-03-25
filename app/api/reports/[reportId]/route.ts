// app/api/reports/[reportId]/route.ts
// Returns full report data. Caller must provide their code as a query param
// so we can verify access before returning.

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getReportById } from "@/lib/reports";
import { validateSubscriptionId } from "@/lib/subscriptions";

const FOUNDING_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);
const ADMIN_SECRET   = process.env.OCWS_ADMIN_SECRET ?? "";

function isAdminOrFounding(code: string): boolean {
  const upper = code.toUpperCase();
  return code === ADMIN_SECRET || upper === "OCWS-CORVUS-FOUNDER-JOSHUA" || FOUNDING_CODES.has(upper);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const url  = new URL(req.url);
    const code = (url.searchParams.get("code") ?? "").trim();

    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const report = await getReportById(reportId);
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const upper = code.toUpperCase();

    // Admin / founding access
    if (isAdminOrFounding(code)) {
      return NextResponse.json({ report });
    }

    // Subscriber must own this report
    if (report.subscriptionId === upper) {
      const valid = await validateSubscriptionId(upper).then(r => r.valid).catch(() => false);
      if (valid) return NextResponse.json({ report });
    }

    // Founding/promo code used to generate this report
    if (report.codeUsed === upper) {
      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  } catch (err) {
    console.error("[reports/[reportId]]", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
