// app/api/waitlist/route.ts
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers as unknown as Headers).get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
      (req.headers as unknown as Headers).get?.("x-real-ip") ??
      "unknown";
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "full",
      timeStyle: "long",
    });

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return Response.json({ success: false, error: "Invalid request." }, { status: 400 });

    // Honeypot
    if (body.honeypot && String(body.honeypot).trim().length > 0) {
      return Response.json({ success: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const tier = String(body.tier ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email) {
      return Response.json({ success: false, error: "Name and email are required." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return Response.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    const to = process.env.OCWS_CONTACT_TO || "joshua@oldcrowswireless.com";
    const from = process.env.SMTP_FROM;

    if (from) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2>New Crow's Eye Waitlist Signup</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Tier:</strong> ${escapeHtml(tier)}</p>
          ${message ? `<p><strong>Message:</strong></p><p style="white-space:pre-wrap;">${escapeHtml(message)}</p>` : ""}
          <hr/>
          <p><strong>Submitted:</strong> ${escapeHtml(timestamp)}</p>
          <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
          <p style="color:#888;">Sent from the OCWS Crow's Eye waitlist form.</p>
        </div>
      `;

      await transporter.sendMail({
        from,
        to,
        subject: `Crow's Eye Waitlist — ${tier} — ${name}`,
        text: `New waitlist signup:\n\nName: ${name}\nEmail: ${email}\nTier: ${tier}\n${message ? `\nMessage:\n${message}` : ""}\n\nSubmitted: ${timestamp}\nIP: ${ip}`,
        html,
        replyTo: email,
      });
    }

    // Append to data/waitlist.json (local dev only — read-only on Vercel)
    try {
      const dataDir = path.join(process.cwd(), "data");
      await fs.mkdir(dataDir, { recursive: true });
      const filePath = path.join(dataDir, "waitlist.json");
      let existing: unknown[] = [];
      try {
        const raw = await fs.readFile(filePath, "utf8");
        existing = JSON.parse(raw) as unknown[];
      } catch {
        // file doesn't exist yet, start fresh
      }
      existing.push({
        id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        tier,
        message: message || null,
        timestamp,
        ip,
      });
      await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf8");
    } catch {
      // Non-fatal — filesystem write fails on Vercel
    }

    return Response.json({ success: true, message: "You're on the list." }, { status: 200 });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return Response.json({ success: false, error: "Failed to process signup." }, { status: 500 });
  }
}
