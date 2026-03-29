import { NextRequest, NextResponse } from 'next/server'
import { generateDemoToken, getDemoTokenURL, DemoAccessLevel } from '@/lib/demoTokens'

const ADMIN_KEY = process.env.ADMIN_DEMO_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY ?? 'SpectrumLife2026!!'
const VIP_CODES = [process.env.VIP_NATE_CODE, process.env.VIP_MIKE_CODE, process.env.VIP_ERIC_CODE]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authKey, accessLevel = 'fledgling', maxUses = 1, label, clientName, allowPDF, allowReckoning } = body

    // Support both expiresInHours (number) and expiryType (string like "48h", "7d")
    let expiresInHours = body.expiresInHours ?? 24;
    if (body.expiryType && typeof body.expiryType === 'string') {
      const map: Record<string, number> = { '1h': 1, '6h': 6, '24h': 24, '48h': 48, '72h': 72, '3d': 72, '7d': 168, '1w': 168 };
      expiresInHours = map[body.expiryType] ?? 24;
    }

    const isAdmin = authKey === ADMIN_KEY
    const isVIP = VIP_CODES.includes(authKey)
    if (!isAdmin && !isVIP) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (isVIP && !isAdmin) {
      const vipAllowed: DemoAccessLevel[] = ['fledgling', 'nest']
      if (!vipAllowed.includes(accessLevel as DemoAccessLevel)) {
        return NextResponse.json({ error: 'VIPs may only generate fledgling or nest demo tokens' }, { status: 403 })
      }
    }

    const allowedHours = [1, 6, 24, 48, 72, 168]
    if (!allowedHours.includes(expiresInHours)) {
      return NextResponse.json({ error: 'Invalid expiry. Use: 1, 6, 24, 48, 72, or 168 hours' }, { status: 400 })
    }

    const token = await generateDemoToken({
      accessLevel: accessLevel as DemoAccessLevel,
      expiresInHours,
      maxUses,
      createdBy: isAdmin ? 'admin' : authKey,
      label,
      clientName,
      allowPDF: (allowPDF ?? body.allowPdf ?? false),
      allowReckoning: allowReckoning ?? false,
    })

    const tokenUrl = getDemoTokenURL(token.token);

    // Send notification email to Joshua with token details
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const recipientName = token.clientName || token.label || 'Unknown';
      const expiresDate = new Date(token.expiresAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.OCWS_CONTACT_TO ?? 'joshua@oldcrowswireless.com',
        subject: `Corvus Demo Token Generated — ${recipientName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1520;padding:24px;border-radius:12px;">
            <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Old Crows Wireless Solutions</p>
            <h2 style="color:#ffffff;margin:0 0 20px;">Demo Token Generated</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Recipient</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${recipientName}</td></tr>
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Access Level</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${token.accessLevel}</td></tr>
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Expires</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${expiresDate}</td></tr>
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Max Uses</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${token.maxUses}</td></tr>
              <tr><td style="color:#888;padding:8px 0;">Token</td><td style="color:#00C2C7;padding:8px 0;text-align:right;font-family:monospace;">${token.token}</td></tr>
            </table>
            <div style="margin:20px 0;background:#1A2332;border:1px solid rgba(0,194,199,0.3);border-radius:8px;padding:16px;text-align:center;">
              <p style="color:#888;font-size:11px;margin:0 0 8px;">DEMO LINK — FORWARD THIS TO RECIPIENT</p>
              <a href="${tokenUrl}" style="color:#00C2C7;font-size:14px;word-break:break-all;">${tokenUrl}</a>
            </div>
            <p style="color:#555;font-size:11px;margin:0;">Generated by ${isAdmin ? 'Admin' : authKey} · Old Crows Wireless Solutions LLC</p>
          </div>
        `,
        text: [
          `Demo Token Generated — ${recipientName}`,
          ``,
          `Recipient: ${recipientName}`,
          `Access Level: ${token.accessLevel}`,
          `Expires: ${expiresDate}`,
          `Max Uses: ${token.maxUses}`,
          `Token: ${token.token}`,
          ``,
          `Demo Link (forward to recipient):`,
          tokenUrl,
        ].join('\n'),
      });
    } catch (emailErr) {
      console.error('[demo/generate] notification email failed (non-fatal):', emailErr);
    }

    return NextResponse.json({
      success: true,
      token: token.token,
      url: tokenUrl,
      accessLevel: token.accessLevel,
      expiresAt: token.expiresAt,
      maxUses: token.maxUses,
      label: token.label,
    })
  } catch (err) {
    console.error('Demo token generate error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
