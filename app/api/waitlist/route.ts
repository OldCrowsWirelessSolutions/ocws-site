// app/api/waitlist/route.ts
import nodemailer from "nodemailer";
import { google } from "googleapis";

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

function tierToTab(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === "nest")   return "Nest";
  if (t === "flock")  return "Flock";
  if (t === "murder") return "Murder";
  return "General";
}

async function appendToGoogleSheet(row: string[], tier: string) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey  = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId     = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    console.log("Google Sheets env vars not configured — skipping sheet append.");
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key:  privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const tab    = tierToTab(tier);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
  console.log(`[waitlist] Appended to Google Sheets tab: ${tab}`);
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
    const phone = String(body.phone ?? "").trim();
    const tier = String(body.tier ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email) {
      return Response.json({ success: false, error: "Name and email are required." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return Response.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    // Google Sheets append (non-fatal)
    try {
      await appendToGoogleSheet([timestamp, name, email, phone, tier, message], tier);
    } catch (sheetErr) {
      console.error("Google Sheets append failed:", sheetErr);
      // Non-fatal — continue and still send email
    }

    // Email notification (non-fatal if not configured)
    const to = process.env.OCWS_CONTACT_TO || "joshua@oldcrowswireless.com";
    const from = process.env.SMTP_FROM;

    if (from) {
      try {
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
            ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
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
          text: `New waitlist signup:\n\nName: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ""}Tier: ${tier}\n${message ? `\nMessage:\n${message}` : ""}\n\nSubmitted: ${timestamp}\nIP: ${ip}`,
          html,
          replyTo: email,
        });
      } catch (mailErr) {
        console.error("Email send failed:", mailErr);
        // Non-fatal
      }
    }

    return Response.json({ success: true, message: "You're on the list." }, { status: 200 });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return Response.json({ success: false, error: "Failed to process signup." }, { status: 500 });
  }
}
