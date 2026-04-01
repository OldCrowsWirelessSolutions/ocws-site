import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { code, clientEmail, clientName, reportId, locationName } = await req.json();

    if (!code || !clientEmail || !reportId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    await transporter.sendMail({
      from: `"Corvus · Old Crows Wireless Solutions" <${process.env.SMTP_FROM}>`,
      to: clientEmail,
      subject: `Your Wireless Verdict — ${locationName}`,
      html: `
        <div style="background:#0D1520;color:#F4F6F8;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
          <div style="color:#00C2C7;font-size:12px;letter-spacing:0.1em;margin-bottom:8px;font-family:monospace;">OLD CROWS WIRELESS SOLUTIONS</div>
          <h1 style="color:#F4F6F8;font-size:22px;margin:0 0 8px;">Your Verdict is ready.</h1>
          <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Hi ${clientName || 'there'},<br/><br/>
            Your wireless diagnostic report for <strong style="color:#F4F6F8;">${locationName}</strong> has been prepared by Corvus.
            Log in to your Crow's Eye dashboard to view the full Verdict and download your branded PDF.
          </p>
          <a href="https://oldcrowswireless.com/dashboard" style="display:inline-block;background:#0D6E7A;color:#F4F6F8;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            View Your Verdict →
          </a>
          <p style="color:#555;font-size:11px;margin-top:32px;line-height:1.6;">
            Corvus, Crow's Eye, The Full Reckoning, and Corvus' Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC.<br/>
            oldcrowswireless.com
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[clients/send-report]', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
