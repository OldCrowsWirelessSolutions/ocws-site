import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'SpectrumLife2026!!';
const VIP_CODES = [
  process.env.VIP_NATE_CODE,
  process.env.VIP_MIKE_CODE,
  process.env.VIP_ERIC_CODE,
];

const LEVEL_LABELS: Record<string, string> = {
  nest: 'Homeowner Tour',
  flock: 'MSP / IT Tour',
  murder: 'RF Engineer Tour',
  full: 'Full Platform Tour',
  verdict: "Corvus' Verdict Deep Dive",
  reckoning: 'Full Reckoning Deep Dive',
  compare: 'Competitive Comparison Tour',
};

export async function POST(req: NextRequest) {
  try {
    const {
      authKey,
      toEmail,
      toName,
      tourUrl,
      tourLevel,
      senderName = 'Joshua Turner',
      type = 'tour',
    } = await req.json();

    const isAdmin = authKey === ADMIN_KEY;
    const isVIP = (VIP_CODES as (string | undefined)[]).includes(authKey);
    if (!isAdmin && !isVIP) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!toEmail || !tourUrl) {
      return NextResponse.json({ error: 'Email and tour URL required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const greeting = toName ? `${toName.split(' ')[0]},` : 'Hello,';
    const firstName = toName ? toName.split(' ')[0] : '';

    const isDemo = type === 'demo';
    const levelLabel = LEVEL_LABELS[tourLevel] || 'Corvus Tour';

    const subject = isDemo
      ? `${firstName ? `${firstName}, ` : ''}Corvus has access for you`
      : `${firstName ? `${firstName}, ` : ''}Corvus has a tour for you`;

    const corvusLine = isDemo
      ? `"I've been given specific instructions to let you in.${firstName ? ` Don't make me regret it, ${firstName}.` : " Don't make me regret it."}"`
      : `"I've been asked to give you a personal walkthrough. I don't do this for everyone.${firstName ? ` Consider yourself fortunate, ${firstName}.` : ' Consider yourself fortunate.'}"`;

    const buttonText = isDemo ? "Access Crow's Eye →" : "Begin Your Personal Tour →";

    const bodyDescription = isDemo
      ? `${senderName} is giving you access to Crow's Eye — an AI wireless diagnostic engine that finds network problems in under 5 minutes, at any technical level, for any building.`
      : `${senderName} wanted to show you what Corvus does — an AI wireless diagnostic engine that finds network problems in under 5 minutes, at any technical level, for any building.`;

    const bodyDetail = isDemo
      ? `Your personal access is ready.`
      : `Your personal <strong style="color:#F4F6F8;">${levelLabel}</strong> is ready.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0D1520;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1520;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1A2332;border-radius:12px;overflow:hidden;border:1px solid rgba(0,194,199,0.2);">

          <tr>
            <td style="background:#0D1520;padding:16px 28px;border-bottom:2px solid #B8922A;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#00C2C7;font-family:monospace;font-size:11px;letter-spacing:2px;">
                      CORVUS · OLD CROWS WIRELESS SOLUTIONS
                    </span>
                  </td>
                  <td align="right">
                    <span style="color:#B8922A;font-family:monospace;font-size:10px;letter-spacing:1px;">
                      ${isDemo ? 'PERSONAL ACCESS' : 'PERSONAL TOUR'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 28px 28px;">

              <p style="color:#F4F6F8;font-size:16px;margin:0 0 12px;line-height:1.5;">
                ${greeting}
              </p>

              <div style="background:#0D1520;border-left:3px solid #00C2C7;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px;">
                <p style="color:#aaa;font-size:13px;font-style:italic;margin:0;line-height:1.6;">
                  ${corvusLine}
                </p>
                <p style="color:#00C2C7;font-family:monospace;font-size:10px;letter-spacing:1px;margin:8px 0 0;">
                  — CORVUS · OLD CROWS WIRELESS SOLUTIONS
                </p>
              </div>

              <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 8px;">
                ${bodyDescription}
              </p>

              <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 28px;">
                ${bodyDetail}
              </p>

              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${tourUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#0D6E7A,#00C2C7);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:8px;letter-spacing:0.3px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#555;font-size:11px;text-align:center;margin:16px 0 0;font-family:monospace;">
                If the button doesn't work, copy this link:<br>
                <a href="${tourUrl}" style="color:#00C2C7;word-break:break-all;">${tourUrl}</a>
              </p>

            </td>
          </tr>

          <tr>
            <td style="background:#0D1520;padding:16px 28px;border-top:1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color:#555;font-size:11px;margin:0;line-height:1.5;">
                      ${senderName} · Old Crows Wireless Solutions<br>
                      <a href="https://oldcrowswireless.com" style="color:#00C2C7;text-decoration:none;">oldcrowswireless.com</a>
                      · Pensacola, FL
                    </p>
                  </td>
                  <td align="right">
                    <p style="color:#555;font-size:10px;font-family:monospace;margin:0;">
                      CORVUS · CROW'S EYE
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const text = `
${greeting}

${corvusLine.replace(/"/g, '')}

${bodyDescription}

${isDemo ? 'Your personal access is ready.' : `Your personal ${levelLabel} is ready.`} Click the link below:

${tourUrl}

If you have questions, reply to this email or visit oldcrowswireless.com.

— ${senderName}
Old Crows Wireless Solutions
oldcrowswireless.com · Pensacola, FL
    `.trim();

    await transporter.sendMail({
      from: `"${senderName} · OCWS" <${process.env.SMTP_FROM}>`,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      replyTo: process.env.SMTP_USER,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tour email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
