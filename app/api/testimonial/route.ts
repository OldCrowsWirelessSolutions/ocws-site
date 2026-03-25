// app/api/testimonial/route.ts
import nodemailer from "nodemailer";
import redis from "@/lib/redis";

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
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return Response.json({ success: false, error: "Invalid request." }, { status: 400 });

    // Honeypot
    if (body.honeypot && String(body.honeypot).trim().length > 0) {
      return Response.json({ success: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const location = String(body.location ?? "").trim();
    const testimonial = String(body.testimonial ?? "").trim();
    const rating = Number(body.rating ?? 5);
    const email = String(body.email ?? "").trim();

    if (!name || !testimonial) {
      return Response.json({ success: false, error: "Name and testimonial are required." }, { status: 400 });
    }
    if (email && !isEmail(email)) {
      return Response.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    // Store in Redis as pending
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const testimonialRecord = {
      id,
      name,
      location,
      testimonial,
      rating: Math.max(1, Math.min(5, rating)),
      email: email || null,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    await redis.set(`testimonial:${id}`, testimonialRecord);
    await redis.lpush("testimonials:pending", id);

    const to = process.env.OCWS_CONTACT_TO || "joshua@oldcrowswireless.com";
    const from = process.env.SMTP_FROM;

    if (from) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const stars = "★".repeat(Math.max(1, Math.min(5, rating))) + "☆".repeat(5 - Math.max(1, Math.min(5, rating)));

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2>New Testimonial Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          ${location ? `<p><strong>Location:</strong> ${escapeHtml(location)}</p>` : ""}
          ${email ? `<p><strong>Email (private):</strong> ${escapeHtml(email)}</p>` : ""}
          <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
          <hr/>
          <p style="white-space:pre-wrap;">${escapeHtml(testimonial)}</p>
          <hr/>
          <p style="color:#888;font-style:italic;">
            Reply APPROVE or REJECT to this email — approval system coming soon.
          </p>
          <p style="color:#888;">Sent from the OCWS testimonials submission form.</p>
        </div>
      `;

      await transporter.sendMail({
        from,
        to,
        subject: `New Testimonial — ${name}${location ? ` (${location})` : ""} — ${stars}`,
        text: [
          "New testimonial submission:",
          "",
          `Name: ${name}`,
          location ? `Location: ${location}` : "",
          email ? `Email (private): ${email}` : "",
          `Rating: ${rating}/5`,
          "",
          "Testimonial:",
          testimonial,
          "",
          "---",
          "Reply APPROVE or REJECT — approval system coming soon.",
        ].filter(Boolean).join("\n"),
        html,
        ...(email ? { replyTo: email } : {}),
      });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Testimonial API error:", err);
    return Response.json({ success: false, error: "Failed to submit testimonial." }, { status: 500 });
  }
}
