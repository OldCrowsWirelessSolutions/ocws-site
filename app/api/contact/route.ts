// app/api/contact/route.ts
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // ensure Node runtime (needed for nodemailer)

type Payload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;

  // honeypot (should be empty)
  company?: string;
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;

    // Honeypot trap: bots often fill hidden fields
    if (body.company && String(body.company).trim().length > 0) {
      return Response.json({ ok: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const subjectRaw = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

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

    const to = process.env.OCWS_CONTACT_TO || "joshua@oldcrowswireless.com";
    const from = process.env.SMTP_FROM;

    if (!from) {
      return Response.json(
        { ok: false, error: "Server email is not configured (SMTP_FROM missing)." },
        { status: 500 }
      );
    }

    const subject =
      subjectRaw.length > 0
        ? `OCWS Contact: ${subjectRaw}`
        : `OCWS Contact: New message from ${name}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const text = [
      "New contact message received:",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "Phone: (none)",
      subjectRaw ? `Subject: ${subjectRaw}` : "Subject: (none)",
      "",
      "Message:",
      message,
      "",
      "— OCWS Website Contact Form",
    ].join("\n");

    const html = `
      <div style="font-family:Arial, sans-serif; line-height:1.5;">
        <h2>New OCWS Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "(none)")}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subjectRaw || "(none)")}</p>
        <hr />
        <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
        <hr />
        <p style="color:#888;">Sent from the OCWS website contact form.</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: email, // so you can hit "Reply" in your email client
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      { ok: false, error: "Failed to send message." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
