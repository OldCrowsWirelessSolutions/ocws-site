// app/api/admin/lifetime-members/route.ts
// Returns lifetime member data for the admin dashboard subscribers tab.
// Performs monthly credit reset check on read.

export const runtime = "nodejs";

import { LIFETIME_CODES, getLifetimeCreditsRemaining } from "@/lib/lifetime-codes";

const ADMIN_KEY = process.env.OCWS_ADMIN_SECRET ?? "SpectrumLife2026!!";

export async function GET(req: Request) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await Promise.all(
      Object.entries(LIFETIME_CODES).map(async ([code, member]) => {
        const creditsRemaining = await getLifetimeCreditsRemaining(code);
        return {
          code,
          name: member.name,
          title: member.title,
          company: member.company,
          tier: member.tier,
          creditsMonthly: member.creditsMonthly,
          creditsRemaining,
          seats: member.seats,
          billing: member.billing,
          note: member.note,
        };
      })
    );
    return Response.json({ members });
  } catch {
    return Response.json({ error: "Failed to load lifetime members" }, { status: 500 });
  }
}
