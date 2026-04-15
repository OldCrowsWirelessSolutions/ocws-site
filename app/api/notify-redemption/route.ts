import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, code, howHeard } = await req.json()

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'joshua@oldcrowswireless.com',
      subject: `[CORVUS] Code Redeemed — ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #0D6E7A;">New Code Redemption</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #888;">Code</td><td style="padding: 6px 0;"><strong>${code}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Name</td><td style="padding: 6px 0;">${name}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Email</td><td style="padding: 6px 0;">${email}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">How they heard</td><td style="padding: 6px 0;">${howHeard || 'not specified'}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Time</td><td style="padding: 6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</td></tr>
          </table>
        </div>
      `
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}
