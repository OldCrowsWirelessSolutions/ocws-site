// app/api/quote/route.ts
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type QuotePayload = {
  name: string;
  email: string;
  phone?: string;

  serviceHref?: string;
  industrySlug?: string;

  // free text
  message: string;

  // triggers (optional)
  triggers?: Record<string, unknown>;

  // addendums (optional)
  recommendedAddendums?: { key: string; title: string }[];

  // honeypot (should be empty)
  company?: string;
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<QuotePayload>;

    // Honeypot trap (bots fill hidden fields)
    if (body.company && String(body.company).trim().length > 0) {
      return Response.json({ ok: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    const serviceHref = String(body.serviceHref ?? "").trim();
    const industrySlug = String(body.industrySlug ?? "").trim();

    const message = String(body.message ?? "").trim();

    const triggers = (body.triggers ?? {}) as Record<string, unknown>;
    const recommendedAddendums = Array.isArray(body.recommendedAddendums)
      ? body.recommendedAddendums
      : [];

    if (!name || !email || !message) {
      return Response.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isEmail(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const to =
      process.env.OCWS_QUOTE_TO ||
      process.env.OCWS_CONTACT_TO ||
      "joshua@oldcrowswireless.com";

    const from = process.env.SMTP_FROM;
    if (!from) {
      return Response.json(
        { ok: false, error: "Server email is not configured (SMTP_FROM missing)." },
        { status: 500 }
      );
    }

    const subjectParts = ["OCWS Quote Request"];
    if (industrySlug) subjectParts.push(`Industry: ${industrySlug}`);
    if (serviceHref) subjectParts.push(`Service: ${serviceHref}`);
    const subject = subjectParts.join(" — ");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const addendumText = recommendedAddendums.length
      ? recommendedAddendums.map((a) => `• ${a.title} (${a.key})`).join("\n")
      : "• (none indicated)";

    const triggerText = Object.keys(triggers).length
      ? Object.entries(triggers)
          .map(([k, v]) => `• ${k}: ${String(v)}`)
          .join("\n")
      : "• (none)";

    const text = [
      "NEW OCWS QUOTE REQUEST",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "(none)"}`,
      "",
      `Service: ${serviceHref || "(not selected)"}`,
      `Industry: ${industrySlug || "(not selected)"}`,
      "",
      "Message:",
      message,
      "",
      "Recommended Addendums:",
      addendumText,
      "",
      "Intake / Trigger Inputs:",
      triggerText,
      "",
      "— Sent from OCWS website Request a Quote form",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New OCWS Quote Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "(none)")}</p>
        <p><strong>Service:</strong> ${escapeHtml(serviceHref || "(not selected)")}</p>
        <p><strong>Industry:</strong> ${escapeHtml(industrySlug || "(not selected)")}</p>
        <hr />
        <h3 style="margin-bottom: 6px;">Message</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        <hr />
        <h3 style="margin-bottom: 6px;">Recommended Addendums</h3>
        <ul>
          ${
            recommendedAddendums.length
              ? recommendedAddendums
                  .map(
                    (a) =>
                      `<li><strong>${escapeHtml(a.title)}</strong> <span style="color:#888;">(${escapeHtml(
                        a.key
                      )})</span></li>`
                  )
                  .join("")
              : "<li>(none indicated)</li>"
          }
        </ul>
        <h3 style="margin-bottom: 6px;">Intake / Trigger Inputs</h3>
        <pre style="background:#111; color:#ddd; padding:12px; border-radius:10px; overflow:auto;">${escapeHtml(
          JSON.stringify(triggers, null, 2)
        )}</pre>
        <p style="color:#888;">Sent from the OCWS website Request a Quote form.</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: email, // hit reply to respond to the requester
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Quote API error:", err);
    return Response.json(
      { ok: false, error: "Failed to send quote request." },
      { status: 500 }
    );
  }
}
