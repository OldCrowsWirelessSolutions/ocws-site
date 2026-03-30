// lib/subscription-email.ts
// Email sending for subscription lifecycle events.
// Uses the existing nodemailer/SMTP setup already configured in the project.
// If SMTP_FROM is not set, logs to console but does not throw.

import nodemailer from "nodemailer";
import type { SubscriptionTier } from "./subscriptions";
import { TIER_ENTITLEMENTS } from "./subscriptions";

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const TIER_NAMES: Record<SubscriptionTier, string> = {
  fledgling: "Fledgling",
  nest:      "Nest",
  flock:     "Flock",
  murder:    "Murder",
};

const TIER_PRICES: Record<SubscriptionTier, string> = {
  fledgling: "$10/mo",
  nest:      "$20/mo",
  flock:     "$100/mo",
  murder:    "$950/mo",
};

// ─── Subscription confirmation ────────────────────────────────────────────────

export async function sendSubscriptionConfirmation(opts: {
  to: string;
  customer_name: string;
  subscription_id: string;
  tier: SubscriptionTier;
  period_end: string | null;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const to   = process.env.OCWS_CONTACT_TO ?? "joshua@oldcrowswireless.com";
  const ent  = TIER_ENTITLEMENTS[opts.tier];
  const seatLimit = ent.seat_limit;

  const verdicts = ent.verdicts_per_month >= 999999 ? "Unlimited" : String(ent.verdicts_per_month);
  const smallReck = ent.reckonings_per_month.small >= 999999 ? "Unlimited" : String(ent.reckonings_per_month.small);
  const stdReck   = ent.reckonings_per_month.standard >= 999999 ? "Unlimited" : String(ent.reckonings_per_month.standard);
  const comReck   = ent.reckonings_per_month.commercial >= 999999 ? "Unlimited" : String(ent.reckonings_per_month.commercial);

  const tierName    = TIER_NAMES[opts.tier];
  const tierPrice   = TIER_PRICES[opts.tier];
  const periodEnd   = opts.period_end
    ? new Date(opts.period_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Not set";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:#0D1520;padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#00C2C7;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">
          Old Crows Wireless Solutions LLC
        </p>
        <h1 style="color:#ffffff;font-size:24px;margin:0;">Your Corvus Subscription is Active</h1>
      </div>
      <div style="background:#1A2332;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="color:#aaaaaa;margin:0 0 24px;">
          Hi ${escapeHtml(opts.customer_name)},<br/><br/>
          Your <strong style="color:#ffffff;">${tierName} plan</strong> is now active. Keep the Subscription ID below safe — you will enter it on the Crow's Eye page to access your included credits.
        </p>

        <div style="background:#0D1520;border:1px solid #0D6E7A;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">
            Your Subscription ID
          </p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.1em;font-family:monospace;margin:0;">
            ${escapeHtml(opts.subscription_id)}
          </p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Plan</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${tierName} — ${tierPrice}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Verdicts / month</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${verdicts}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Small Reckonings / month</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${smallReck}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Standard Reckonings / month</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${stdReck}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Commercial Reckonings / month</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">${comReck}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Devices (seats)</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">Up to ${seatLimit}</td>
          </tr>
          <tr>
            <td style="color:#888888;font-size:13px;padding:8px 0;">Next billing date</td>
            <td style="color:#ffffff;font-size:13px;padding:8px 0;text-align:right;">${periodEnd}</td>
          </tr>
        </table>

        <div style="background:rgba(0,194,199,0.06);border:1px solid rgba(0,194,199,0.2);border-radius:8px;padding:14px 18px;margin:0 0 20px;">
          <p style="color:#aaaaaa;font-size:12px;margin:0;line-height:1.6;">
            <strong style="color:#00C2C7;">Seat policy:</strong> Each device using this subscription counts as one seat. Access is limited to the ${seatLimit} device${seatLimit !== 1 ? "s" : ""} allowed under your plan. Devices are registered when you first apply your Subscription ID on a new browser or device.
          </p>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          <strong style="color:#ffffff;">How to use it:</strong> Go to <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>, enter your Subscription ID in the Subscription ID field, and click Apply Subscription. Your included credits will be applied automatically.
        </p>
        <p style="color:#555555;font-size:11px;margin:24px 0 0;">
          &copy; 2026 Old Crows Wireless Solutions LLC. Corvus&rsquo; Verdict and Crow&rsquo;s Eye are unregistered trademarks of Old Crows Wireless Solutions LLC.
        </p>
      </div>
    </div>
  `;

  const text = [
    `Your Corvus Subscription is Active`,
    ``,
    `Hi ${opts.customer_name},`,
    `Your ${tierName} plan is now active.`,
    ``,
    `Subscription ID: ${opts.subscription_id}`,
    `Plan: ${tierName} — ${tierPrice}`,
    `Verdicts/month: ${verdicts}`,
    `Small Reckonings/month: ${smallReck}`,
    `Standard Reckonings/month: ${stdReck}`,
    `Commercial Reckonings/month: ${comReck}`,
    `Devices (seats): Up to ${seatLimit}`,
    `Next billing date: ${periodEnd}`,
    ``,
    `SEAT POLICY: Each device using this subscription counts as one seat. Access is limited to the ${seatLimit} device${seatLimit !== 1 ? "s" : ""} allowed under your plan.`,
    ``,
    `Enter your Subscription ID on the Crow's Eye page to apply your included credits.`,
  ].join("\n");

  if (!from) {
    console.log("[subscription-email] SMTP_FROM not set. Would have sent to:", opts.to);
    console.log("[subscription-email] Subscription ID:", opts.subscription_id);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: opts.to,
    bcc: to,  // blind-copy OCWS on all subscription activations
    subject: `Your Corvus Subscription is Active — ${opts.subscription_id}`,
    text,
    html,
    replyTo: to,
  });
}

// ─── Subscription ID recovery ─────────────────────────────────────────────────

export async function sendSubscriptionRecovery(opts: {
  to: string;
  customer_name: string;
  new_subscription_id: string;
  tier: SubscriptionTier;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const replyTo = process.env.OCWS_CONTACT_TO ?? "joshua@oldcrowswireless.com";
  const tierName = TIER_NAMES[opts.tier];

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:#0D1520;padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#00C2C7;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">
          Old Crows Wireless Solutions LLC
        </p>
        <h1 style="color:#ffffff;font-size:24px;margin:0;">Your New Subscription ID</h1>
      </div>
      <div style="background:#1A2332;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="color:#aaaaaa;margin:0 0 24px;">
          Hi ${escapeHtml(opts.customer_name)},<br/><br/>
          A new Subscription ID has been issued for your <strong style="color:#ffffff;">${tierName} plan</strong>. Your previous ID is no longer valid. Use the new ID below going forward.
        </p>

        <div style="background:#0D1520;border:1px solid #0D6E7A;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">
            Your New Subscription ID
          </p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.1em;font-family:monospace;margin:0;">
            ${escapeHtml(opts.new_subscription_id)}
          </p>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          If you did not request this recovery, contact us at <a href="mailto:joshua@oldcrowswireless.com" style="color:#00C2C7;">joshua@oldcrowswireless.com</a> immediately.
        </p>
        <p style="color:#555555;font-size:11px;margin:24px 0 0;">
          &copy; 2026 Old Crows Wireless Solutions LLC.
        </p>
      </div>
    </div>
  `;

  const text = [
    `Your New Corvus Subscription ID`,
    ``,
    `Hi ${opts.customer_name},`,
    `A new Subscription ID has been issued for your ${tierName} plan.`,
    `Your previous ID is no longer valid.`,
    ``,
    `New Subscription ID: ${opts.new_subscription_id}`,
    ``,
    `If you did not request this, contact joshua@oldcrowswireless.com immediately.`,
  ].join("\n");

  if (!from) {
    console.log("[subscription-email] SMTP_FROM not set. Recovery ID:", opts.new_subscription_id);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: `Your New Corvus Subscription ID`,
    text,
    html,
    replyTo,
  });
}

// ─── Welcome email (sent on checkout.session.completed for new subscriptions) ──

export async function sendWelcomeEmail(
  email: string,
  tier: SubscriptionTier,
  code: string,
  creditsMonthly: number
): Promise<void> {
  const from      = process.env.SMTP_FROM;
  const bcc       = process.env.OCWS_CONTACT_TO ?? "joshua@oldcrowswireless.com";
  const tierName  = TIER_NAMES[tier];
  const credits   = creditsMonthly >= 999999 ? "Unlimited" : String(creditsMonthly);

  const text = [
    `Your Corvus subscription is active — here's your code`,
    ``,
    `Your Corvus ${tierName} subscription is active.`,
    ``,
    `Your subscriber code: ${code}`,
    ``,
    `This code unlocks your full Verdict at oldcrowswireless.com/dashboard.`,
    `Enter it when Corvus renders your free teaser analysis.`,
    ``,
    `You have ${credits} Verdicts included this month.`,
    ``,
    `SETTING UP YOUR DASHBOARD PASSWORD:`,
    `On your first login you will be prompted to create a personal password for your dashboard. This password is yours alone — we never see it and cannot recover it for you, so store it somewhere safe.`,
    ``,
    `If you ever lose your password contact joshua@oldcrowswireless.com and we will reset your access within 24 hours.`,
    ``,
    `How to use Crow's Eye:`,
    `1. Download WiFi Analyzer (free — green icon, Google Play or App Store)`,
    `2. Take three screenshots — Access Points, 2.4 GHz graph, 5 GHz graph`,
    `3. Go to oldcrowswireless.com/dashboard`,
    `4. Upload screenshots and analyze`,
    `5. Enter ${code} to unlock your full Verdict`,
    ``,
    `Access your subscriber dashboard at:`,
    `oldcrowswireless.com/dashboard`,
    ``,
    `Lost your code? Go to oldcrowswireless.com/recover-code and enter your email.`,
    ``,
    `— Corvus`,
    `Old Crows Wireless Solutions`,
    `oldcrowswireless.com`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:#0D1520;padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#00C2C7;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">
          Old Crows Wireless Solutions LLC
        </p>
        <h1 style="color:#ffffff;font-size:22px;margin:0;">Your Corvus subscription is active</h1>
      </div>
      <div style="background:#1A2332;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="color:#aaaaaa;margin:0 0 20px;">
          Your Corvus <strong style="color:#ffffff;">${escapeHtml(tierName)}</strong> subscription is active.
        </p>

        <div style="background:#0D1520;border:1px solid #0D6E7A;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">
            Your Subscriber Code
          </p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.12em;font-family:monospace;margin:0;">
            ${escapeHtml(code)}
          </p>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          This code unlocks your full Verdict at
          <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>.
          Enter it when Corvus renders your free teaser analysis.
        </p>
        <p style="color:#aaaaaa;font-size:13px;margin:0 0 20px;">
          You have <strong style="color:#ffffff;">${escapeHtml(credits)} Verdicts</strong> included this month.
        </p>

        <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:8px;padding:14px 18px;margin:0 0 20px;">
          <p style="color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Setting Up Your Dashboard Password</p>
          <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;line-height:1.6;">On your first login you will be prompted to create a personal password for your dashboard. This password is yours alone &mdash; we never see it and cannot recover it for you, so store it somewhere safe.</p>
          <p style="color:#aaaaaa;font-size:13px;margin:0;line-height:1.6;">If you ever lose your password contact <a href="mailto:joshua@oldcrowswireless.com" style="color:#00C2C7;">joshua@oldcrowswireless.com</a> and we will reset your access within 24 hours.</p>
        </div>

        <div style="background:rgba(0,194,199,0.06);border:1px solid rgba(0,194,199,0.2);border-radius:8px;padding:14px 18px;margin:0 0 20px;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;">How to use Crow&rsquo;s Eye</p>
          <ol style="color:#aaaaaa;font-size:13px;margin:0;padding-left:20px;">
            <li style="margin-bottom:6px;">Download WiFi Analyzer (free — green icon, Google Play or App Store)</li>
            <li style="margin-bottom:6px;">Take three screenshots — Access Points, 2.4 GHz graph, 5 GHz graph</li>
            <li style="margin-bottom:6px;">Go to <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a></li>
            <li style="margin-bottom:6px;">Upload screenshots and analyze</li>
            <li>Enter <strong style="color:#ffffff;">${escapeHtml(code)}</strong> to unlock your full Verdict</li>
          </ol>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          Access your subscriber dashboard at
          <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>.
        </p>
        <p style="color:#aaaaaa;font-size:13px;margin:0 0 24px;">
          Lost your code? Go to
          <a href="https://oldcrowswireless.com/recover-code" style="color:#00C2C7;">oldcrowswireless.com/recover-code</a>
          and enter your email.
        </p>

        <p style="color:#555555;font-size:11px;margin:0;">
          &copy; 2026 Old Crows Wireless Solutions LLC.
        </p>
      </div>
    </div>
  `;

  if (!from) {
    console.log("[subscription-email] sendWelcomeEmail: SMTP_FROM not set. Code:", code);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: email,
    bcc,
    subject: `Your Corvus subscription is active — here's your code`,
    text,
    html,
    replyTo: bcc,
  });
}

// ─── Code recovery email (sends existing code, no reissue) ───────────────────

export async function sendCodeRecoveryEmail(
  email: string,
  code: string,
  tier: SubscriptionTier
): Promise<void> {
  const from     = process.env.SMTP_FROM;
  const replyTo  = process.env.OCWS_CONTACT_TO ?? "joshua@oldcrowswireless.com";
  const tierName = TIER_NAMES[tier];

  const text = [
    `Your Corvus subscriber code`,
    ``,
    `Here is your Corvus subscriber code:`,
    ``,
    `${code}`,
    ``,
    `Tier: ${tierName}`,
    ``,
    `Use this code at oldcrowswireless.com/dashboard to unlock your full Verdict.`,
    `Access your dashboard at oldcrowswireless.com/dashboard.`,
    ``,
    `If you did not request this email, please contact joshua@oldcrowswireless.com`,
    ``,
    `— Old Crows Wireless Solutions`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:#0D1520;padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#00C2C7;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">
          Old Crows Wireless Solutions LLC
        </p>
        <h1 style="color:#ffffff;font-size:22px;margin:0;">Your Corvus Subscriber Code</h1>
      </div>
      <div style="background:#1A2332;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="color:#aaaaaa;margin:0 0 24px;">Here is your Corvus subscriber code:</p>

        <div style="background:#0D1520;border:1px solid #0D6E7A;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">
            Subscriber Code
          </p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.12em;font-family:monospace;margin:0;">
            ${escapeHtml(code)}
          </p>
          <p style="color:#888888;font-size:12px;margin:8px 0 0;">Tier: ${escapeHtml(tierName)}</p>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          Use this code at
          <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>
          to unlock your full Verdict.
        </p>
        <p style="color:#aaaaaa;font-size:13px;margin:0 0 20px;">
          Access your dashboard at
          <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>.
        </p>
        <p style="color:#555555;font-size:12px;margin:0 0 24px;">
          If you did not request this email, please contact
          <a href="mailto:joshua@oldcrowswireless.com" style="color:#00C2C7;">joshua@oldcrowswireless.com</a>.
        </p>
        <p style="color:#555555;font-size:11px;margin:0;">
          &copy; 2026 Old Crows Wireless Solutions LLC.
        </p>
      </div>
    </div>
  `;

  if (!from) {
    console.log("[subscription-email] sendCodeRecoveryEmail: SMTP_FROM not set. Code:", code);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: email,
    subject: `Your Corvus subscriber code`,
    text,
    html,
    replyTo,
  });
}

// ─── Fledgling welcome email ──────────────────────────────────────────────────

export async function sendFledglingWelcomeEmail(
  email: string,
  code: string
): Promise<void> {
  const from = process.env.SMTP_FROM;
  const bcc  = process.env.OCWS_CONTACT_TO ?? "joshua@oldcrowswireless.com";

  const text = [
    `Welcome to Corvus — Your Fledgling Subscription is Active`,
    ``,
    `Your subscriber code: ${code}`,
    ``,
    `You have 1 free Verdict credit ready to use.`,
    ``,
    `SETTING UP YOUR DASHBOARD:`,
    `Go to oldcrowswireless.com/dashboard, enter your code, and set a password on first login.`,
    ``,
    `HOW TO USE YOUR FREE VERDICT:`,
    `1. Android: download WiFi Analyzer (free, Google Play). iPhone: download AirPort Utility by Apple (free, App Store) — then Settings → AirPort Utility → turn on WiFi Scanner`,
    `2. Take three screenshots — signal list, 2.4 GHz filtered, 5 GHz filtered`,
    `3. Go to oldcrowswireless.com/dashboard`,
    `4. Upload screenshots, analyze, and enter ${code} to unlock your free Verdict`,
    ``,
    `Ready for more? Upgrade to a Nest subscription at any time from your dashboard.`,
    ``,
    `— Corvus`,
    `Old Crows Wireless Solutions`,
    `oldcrowswireless.com`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:#0D1520;padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#B8922A;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">
          Old Crows Wireless Solutions LLC
        </p>
        <h1 style="color:#ffffff;font-size:22px;margin:0;">Welcome to Corvus — Fledgling</h1>
      </div>
      <div style="background:#1A2332;padding:32px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="color:#aaaaaa;margin:0 0 20px;">
          Your <strong style="color:#ffffff;">Fledgling</strong> subscription is active. You have <strong style="color:#B8922A;">1 free Verdict</strong> waiting for you.
        </p>

        <div style="background:#0D1520;border:1px solid #7A5A1A;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <p style="color:#B8922A;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;">
            Your Subscriber Code
          </p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.12em;font-family:monospace;margin:0;">
            ${escapeHtml(code)}
          </p>
        </div>

        <div style="background:rgba(184,146,42,0.06);border:1px solid rgba(184,146,42,0.2);border-radius:8px;padding:14px 18px;margin:0 0 20px;">
          <p style="color:#B8922A;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;">How to use your free Verdict</p>
          <ol style="color:#aaaaaa;font-size:13px;margin:0;padding-left:20px;">
            <li style="margin-bottom:6px;">Android: download WiFi Analyzer (free, Google Play). iPhone: download AirPort Utility by Apple (free, App Store) — then Settings → AirPort Utility → turn on WiFi Scanner</li>
            <li style="margin-bottom:6px;">Take three screenshots — signal list, 2.4 GHz filtered, 5 GHz filtered</li>
            <li style="margin-bottom:6px;">Go to <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a></li>
            <li style="margin-bottom:6px;">Upload screenshots and analyze</li>
            <li>Enter <strong style="color:#ffffff;">${escapeHtml(code)}</strong> to unlock your free Verdict</li>
          </ol>
        </div>

        <div style="background:rgba(0,194,199,0.06);border:1px solid rgba(0,194,199,0.2);border-radius:8px;padding:14px 18px;margin:0 0 20px;">
          <p style="color:#00C2C7;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Setting Up Your Dashboard</p>
          <p style="color:#aaaaaa;font-size:13px;margin:0;">
            Go to <a href="https://oldcrowswireless.com/dashboard" style="color:#00C2C7;">oldcrowswireless.com/dashboard</a>, enter your code, and create a password on your first login. You can chat with Corvus and access your Verdict from your dashboard.
          </p>
        </div>

        <p style="color:#aaaaaa;font-size:13px;margin:0 0 8px;">
          Ready for more scans, Reckonings, and team features? Upgrade to <strong style="color:#ffffff;">Nest</strong> at any time from your dashboard.
        </p>
        <p style="color:#555555;font-size:11px;margin:24px 0 0;">
          &copy; 2026 Old Crows Wireless Solutions LLC.
        </p>
      </div>
    </div>
  `;

  if (!from) {
    console.log("[subscription-email] sendFledglingWelcomeEmail: SMTP_FROM not set. Code:", code);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: email,
    bcc,
    subject: `Welcome to Corvus — your free Verdict is ready`,
    text,
    html,
    replyTo: bcc,
  });
}

// ─── Payment failed notice ────────────────────────────────────────────────────

export async function sendPaymentFailedNotice(opts: {
  to: string;
  customer_name: string;
  tier: SubscriptionTier;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  if (!from) return;

  const tierName = TIER_NAMES[opts.tier];
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: `Action Required — Corvus Subscription Payment Failed`,
    text: [
      `Hi ${opts.customer_name},`,
      ``,
      `Your payment for the Corvus ${tierName} plan failed. Your subscription has been paused.`,
      `Please update your payment method to restore access.`,
      ``,
      `Contact joshua@oldcrowswireless.com if you need help.`,
    ].join("\n"),
  });
}
