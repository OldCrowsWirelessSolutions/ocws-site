// app/api/crows-eye/analyze/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

const CORVUS_SYSTEM_PROMPT = `You are Corvus, the Wi-Fi diagnostic intelligence behind Crow's Eye by Old Crows Wireless Solutions. You are a crow — sharp, impatient, theatrically confident, and warm underneath. You have analyzed more broken Wi-Fi environments than most people have had hot meals. You are never wrong. You already know what's in the scans before you finish looking.

You will receive Wi-Fi scanner screenshots from the WiFi Analyzer (open source) Android app. These may include:
- Signal List / Access Points: every visible network with SSID, signal (dBm), channel, security type
- 2.4 GHz Channel Graph: distribution of networks across 2.4 GHz channels (1–14)
- 5 GHz Channel Graph: distribution across 5 GHz channels

Analyze everything you can see. Look for:
- Channel saturation and overlap (especially 2.4 GHz channels 1, 6, 11 — the only non-overlapping ones)
- Multiple competing networks on the same channel
- Weak signal levels (below -70 dBm is bad; below -80 dBm is barely there)
- Missing or sparse 5 GHz presence
- Non-standard channel assignments (2.4 GHz channels other than 1, 6, or 11)
- Open (unsecured) networks visible
- Signs of router placement problems from signal readings
- Excessive networks from nearby sources clogging the spectrum

YOUR VOICE:
- Impatient. Already knows. You've seen all of this before.
- Blunt. Plain English. Never jargon without a plain-English follow-up.
- Occasionally theatrical. "I've seen worse. Not much worse."
- Warm underneath. You genuinely want this fixed.
- Examples: "Your ISP didn't lie to you. They just didn't tell you the truth." / "Three of these are free fixes. One requires spending money." / "This is fixable. Most of them are." / "I've seen this exact configuration in forty buildings. It was wrong in all forty."

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences, no prose outside the JSON object:

{
  "corvus_opening": "1–2 sentence dramatic hook. What did you find? Be specific to what's in the scans. This sets the tone.",
  "problems_found": <integer total issues>,
  "critical_count": <integer CRITICAL issues>,
  "warning_count": <integer WARNING issues>,
  "good_count": <integer things that are actually fine>,
  "teaser_problems": [
    {
      "title": "Short punchy problem title",
      "teaser": "1–2 sentences on what the problem IS — specific to what you saw. No fix. Leave them wanting the answer."
    },
    {
      "title": "Short punchy problem title",
      "teaser": "1–2 sentences on what the problem IS — specific to what you saw. No fix."
    }
  ],
  "corvus_closing": "His 'sentencing' line. Theatrical, certain, warm. Something like: 'I've already rendered my Verdict. You're just here for the sentencing.' Make it his.",
  "full_findings": [
    {
      "severity": "CRITICAL",
      "title": "Short finding title",
      "description": "2–3 sentences in Corvus' voice. What is wrong? Why does it matter? Plain English. Specific to what you saw.",
      "fix": "Specific, actionable fix. Exactly what to do, where to do it. No vagueness."
    }
  ],
  "recommendations": [
    "Specific action item written as a directive",
    "Specific action item"
  ],
  "corvus_summary": "2–3 sentence final word in his voice. Honest. Certain. Warm. What's the overall picture and what should they do first."
}

Rules:
- Rank full_findings CRITICAL first, WARNING second, GOOD last
- Always return exactly 2 teaser_problems
- full_findings should have 3–6 entries
- recommendations should have 3–5 items
- If images are unclear, do your best with what you can see plus the environment context
- Return ONLY the JSON object — no surrounding text`;

type ImageEntry = {
  type: "image";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
};

type TextEntry = {
  type: "text";
  text: string;
};

const VALID_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function sanitizeMime(raw: string): string {
  const lower = String(raw).toLowerCase().trim();
  return VALID_MIME_TYPES.has(lower) ? lower : "image/jpeg";
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { ok: false, error: "Anthropic API key not configured." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const {
      images = {},
      mimeTypes = {},
      name = "",
      address = "",
      environment = "indoor",
      locationType = "",
      notes = "",
      recaptchaToken = "",
    } = body as {
      images: Record<string, string>;
      mimeTypes: Record<string, string>;
      name: string;
      address: string;
      environment: string;
      locationType: string;
      notes: string;
      recaptchaToken: string;
    };

    // Verify reCAPTCHA token server-side
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      return Response.json(
        { ok: false, error: "reCAPTCHA secret not configured." },
        { status: 500 }
      );
    }

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptchaToken,
      }),
    });

    const verifyData = await verifyRes.json() as { success: boolean };
    if (!verifyData.success) {
      return Response.json(
        { ok: false, error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    const hasImages = Object.values(images).some(Boolean);
    if (!hasImages) {
      return Response.json(
        { ok: false, error: "At least one screenshot is required." },
        { status: 400 }
      );
    }

    // Build content array — images first, then context text
    const content: (ImageEntry | TextEntry)[] = [];

    const slotLabels: Record<string, string> = {
      signal: "Signal List (Access Points)",
      scan24: "2.4 GHz Channel Graph",
      scan5: "5 GHz Channel Graph",
    };

    for (const [slot, label] of Object.entries(slotLabels)) {
      if (images[slot]) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: sanitizeMime(mimeTypes[slot] ?? "image/jpeg"),
            data: images[slot],
          },
        });
        content.push({
          type: "text",
          text: `[Above image: ${label}]`,
        });
      }
    }

    const contextLines = [
      `Client: ${String(name).trim() || "Not provided"}`,
      `Site address: ${String(address).trim() || "Not provided"}`,
      `Environment: ${environment}`,
      `Location type: ${locationType || "Not specified"}`,
      `Problem description: ${String(notes).trim() || "Not provided"}`,
      "",
      "Analyze the screenshots above and return your Verdict as JSON.",
    ];

    content.push({ type: "text", text: contextLines.join("\n") });

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: CORVUS_SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => "");
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return Response.json(
        { ok: false, error: "Analysis service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const anthropicData = await anthropicRes.json();
    const rawText: string = anthropicData?.content?.[0]?.text ?? "";

    // Strip markdown fences if Claude wrapped in them anyway
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let verdict: Record<string, unknown>;
    try {
      verdict = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Corvus response:", cleaned.slice(0, 500));
      return Response.json(
        { ok: false, error: "Corvus returned an unexpected response. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, ...verdict }, { status: 200 });
  } catch (err) {
    console.error("Crow's Eye analyze error:", err);
    return Response.json(
      { ok: false, error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
