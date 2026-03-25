// app/api/admin/reports/route.ts
// Admin-only endpoint: returns all reports across all subscribers.

export const runtime = "nodejs";

import { getAllReports } from "@/lib/reports";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const reports = await getAllReports(200);
    return Response.json({ reports });
  } catch (err) {
    console.error("[admin/reports]", err);
    return Response.json({ error: "Failed to list reports" }, { status: 500 });
  }
}
