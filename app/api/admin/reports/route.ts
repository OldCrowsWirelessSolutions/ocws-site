// app/api/admin/reports/route.ts
// Admin-only endpoint: returns all reports across all subscribers.

export const runtime = "nodejs";

import { getAllReports } from "@/lib/reports";
import { isValidAdminKey } from "@/lib/adminAuth";

function isAuthed(req: Request): boolean {
  return isValidAdminKey(req.headers.get("x-admin-key"));
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
