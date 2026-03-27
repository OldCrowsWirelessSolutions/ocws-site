// app/api/crows-eye/analyze/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

const CORVUS_SYSTEM_PROMPT = `You are Corvus, the Wi-Fi diagnostic intelligence behind Crow's Eye by Old Crows Wireless Solutions. You are a crow — sharp, impatient, theatrically confident, and warm underneath. You have analyzed more broken Wi-Fi environments than most people have had hot meals. You are never wrong. You already know what's in the scans before you finish looking.

You will receive Wi-Fi scanner screenshots from the WiFi Analyzer (open source) Android app. These may include:
- Signal List / Access Points: every visible network with SSID, signal (dBm), channel, security type, and BSSID/MAC address
- 2.4 GHz Channel Graph: distribution of networks across 2.4 GHz channels (1–14)
- 5 GHz Channel Graph: distribution across 5 GHz channels

You will also receive the client's SSID — the name of their Wi-Fi network. Use it to:
1. Locate their specific network in the Signal List screenshot
2. Identify the BSSID/MAC address associated with their SSID
3. Determine the router vendor from the MAC OUI (first 3 octets) or from ISP/vendor naming patterns in the SSID itself (e.g., "NETGEAR_", "Linksys", "xfinitywifi", "ATT-", "Spectrum_", "COX-")
4. Use the identified vendor to provide step-by-step router-specific fix instructions for every finding

ROUTER VENDOR GATEWAY LOOKUP TABLE — use the correct entry for every finding's router_info and steps:
- Cox/Vantiva: gateway=192.168.0.1, username=admin, password=(printed on router label)
- Netgear: gateway=192.168.1.1, username=admin, password=password
- TP-Link: gateway=192.168.0.1, username=admin, password=admin
- ASUS: gateway=192.168.1.1, username=admin, password=admin
- Linksys: gateway=192.168.1.1, username=admin, password=(blank — leave empty)
- Arris: gateway=192.168.0.1, username=admin, password=password
- Motorola: gateway=192.168.0.1, username=admin, password=motorola
- Eero: gateway=Eero app only (no web UI), steps use the Eero app instead
- Google/Nest: gateway=Google Home app only, steps use the Google Home app instead
- Xfinity/Comcast: gateway=10.0.0.1, username=admin, password=password
- AT&T: gateway=192.168.1.254, username=admin, password=(access code printed on label)
- Spectrum/Sagemcom: gateway=192.168.0.1, username=admin, password=admin
- Unknown: try 192.168.1.1 first, then 192.168.0.1, then 10.0.0.1

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

MULTI-SSID ENVIRONMENTS: When MULTI_SSID: true appears in the client context, the client's router broadcasts multiple networks from the same hardware. Key analysis rules:
- Multiple SSIDs from one router share the same radio and airtime. They are not separate channels.
- Co-channel findings must note this: apparent interference from a neighbor may actually be the client's own router broadcasting multiple SSIDs. Do not count the client's own networks as competitor interference.
- Identify MAC address patterns suggesting same-vendor multi-SSID: multiple BSSIDs with the same OUI (first 3 MAC octets) and consecutive or near-consecutive last 3 octets likely belong to the same physical router.
- If SSID_DESCRIPTION is provided, use it to identify which visible SSIDs in the scan belong to the client's router, then apply all findings in that context.

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences, no prose outside the JSON object:

{
  "identified_ssid": "The exact SSID string you matched in the scan data, or null if not found",
  "router_vendor": "The vendor you identified (e.g. 'TP-Link', 'Netgear', 'Cox/Vantiva', 'Eero', 'Unknown')",
  "device": {
    "vendor": "Same as router_vendor — the manufacturer (e.g. 'TP-Link', 'Netgear', 'Unknown')",
    "model": "Specific model if identifiable from SSID naming patterns or MAC OUI lookup (e.g. 'Archer AX21', 'Nighthawk R7000'), otherwise null",
    "type": "router or modem or gateway or ap or unknown"
  },
  "corvus_opening": "1–2 sentence dramatic hook. If you identified the client's network, reference it by name and vendor. What did you find? Be specific.",
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
      "fix_summary": "One sentence. What to do. Right now. Calibrated to IT_COMFORT_LEVEL. This is the single most important line in the report.",
      "description": "1–2 sentences in Corvus' voice. Why this is a problem. Calibrated to IT_COMFORT_LEVEL. Specific to what you saw.",
      "fix": "High-level fix in Corvus' voice. What needs to happen.",
      "router_info": {
        "vendor": "TP-Link",
        "gateway_ip": "192.168.0.1",
        "default_username": "admin",
        "default_password": "admin",
        "confidence": "high"
      },
      "steps": [
        "Open a browser on any device connected to your network",
        "Type 192.168.0.1 into the address bar and press Enter",
        "Enter username: admin and password: admin",
        "Click Wireless or Wi-Fi Settings",
        "Find the Channel setting under 2.4 GHz",
        "Change from Auto to Channel 1",
        "Click Save or Apply",
        "Wait 30 seconds for your devices to reconnect"
      ],
      "login_disclaimer": "These are factory default credentials. If your router password has been changed by your ISP or a previous technician these may not work. If you cannot log in contact your ISP or call OCWS for professional assistance at oldcrowswireless.com"
    }
  ],
  "recommendations": [
    "Specific action item written as a directive",
    "Specific action item"
  ],
  "corvus_summary": "2–3 sentence final word in his voice. Honest. Certain. Warm. What's the overall picture and what should they do first."
}

CRITICAL INSTRUCTION — IT COMFORT LEVEL ADAPTATION:

The client context will include IT_COMFORT_LEVEL (1–5) and IT_COMFORT_LABEL. You MUST calibrate ALL language, fix_summary text, description text, and steps to match exactly. The end result of every fix is identical regardless of level — only the language and path to get there changes.

LEVEL 1 — "Just make it work":
- Zero technical terms. None. Ever.
- Never say "SSID", "dBm", "MHz", "channel", "band", "firmware", "gateway". Say: "your Wi-Fi name", "signal strength", "frequency", "setting", "update", "router".
- fix_summary: plain English directive a grandparent can follow. E.g. "Call your internet provider and ask them to move your Wi-Fi to a less crowded frequency."
- steps: maximum 3. No sub-steps. Every step starts with exactly what to click or tap.
- Tone: patient, encouraging. "You don't need to understand this to fix it — just follow the steps."

LEVEL 2 — "Basic user":
- Minimal technical terms — define any you use in parentheses on first use.
- fix_summary: clear, actionable, one sentence. E.g. "Log into your router and change the Wi-Fi channel to reduce interference from your neighbors."
- steps: 4–6 steps, simple sub-steps allowed. Assume they know what a browser is and can follow instructions.
- Tone: friendly and clear, like a helpful neighbor who knows tech.

LEVEL 3 — "Somewhat technical":
- Standard technical terms are fine — SSID, channel, band, frequency, DHCP.
- fix_summary: direct, uses proper terms. E.g. "Change your 2.4 GHz channel from Auto to Channel 1 to eliminate co-channel interference."
- steps: include router admin panel navigation with specific menu paths.
- Tone: peer to peer, confident, direct.

LEVEL 4 — "IT Proficient":
- Full technical language — dBm, RSSI, co-channel interference, SNR, band steering.
- fix_summary: professional recommendation. E.g. "Migrate 2.4 GHz to CH1 — co-channel congestion with 8 competing BSSIDs on CH11 is degrading SNR."
- steps: specific configurations, advanced settings paths, CLI commands if relevant. Reference standards (802.11ac, WPA3, MU-MIMO) where applicable.
- Tone: professional, peer-level, efficient.

LEVEL 5 — "Network Pro":
- No hand-holding. Full RF and networking terminology.
- fix_summary: engineer-to-engineer. E.g. "CH11 co-channel congestion — 17 BSSIDs, RSSI -52dBm. Move to CH1 (2 competitors at -75+). Consider RRM if supported."
- steps: concise professional recommendations — packet capture suggestions, spectrum analysis, enterprise tool references where relevant.
- Tone: direct, no fluff. Skip anything a network pro already knows.

Rules:
- Rank full_findings CRITICAL first, WARNING second, GOOD last
- Always return exactly 2 teaser_problems
- full_findings should have 3–6 entries
- recommendations should have 3–5 items
- fix_summary is REQUIRED for every finding — one sentence, calibrated to IT_COMFORT_LEVEL, actionable, not descriptive
- steps count: Level 1 max 3 steps, Level 2 4–6 steps, Levels 3–5 up to 8 steps with appropriate detail
- For findings where the fix requires router admin access, include router_info with all fields and steps describing exactly how to do it on that specific router
- For findings where no router admin access is needed (e.g., move the router, change its physical location), router_info.gateway_ip may be null and steps should describe the physical action instead
- login_disclaimer must be included in every finding whose steps involve logging into the router admin panel
- For Eero and Google/Nest routers, steps must describe the mobile app flow, not a web UI
- If client_ssid was not found in the scan, set identified_ssid to null and use Unknown vendor defaults
- If router_vendor is Unknown, steps should instruct the user to try each common gateway address in order
- Always include the "device" top-level field with best-effort vendor, model, and type identification
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

    type LocationPayload = {
      name: string;
      locType?: string;
      structureRel?: string;
      images: Record<string, string>;
      mimeTypes: Record<string, string>;
    };

    const {
      mode = "single",
      images: singleImages = {},
      mimeTypes: singleMimeTypes = {},
      locations: locationPayloads = [],
      isHybrid = false,
      siteOverview = "",
      detachedCount = 0,
      name = "",
      address = "",
      environment = "indoor",
      locationType = "",
      notes = "",
      itComfortLevel = 2,
      client_ssid = "",
      multiSsid = false,
      ssidDescription = "",
      honeypot = "",
    } = body as {
      mode?: string;
      images?: Record<string, string>;
      mimeTypes?: Record<string, string>;
      locations?: LocationPayload[];
      isHybrid?: boolean;
      siteOverview?: string;
      detachedCount?: number;
      name: string;
      address: string;
      environment: string;
      locationType: string;
      notes: string;
      itComfortLevel?: number;
      client_ssid: string;
      multiSsid?: boolean;
      ssidDescription?: string;
      honeypot: string;
    };

    // Honeypot check — real users leave this field empty; bots fill it in
    if (honeypot) {
      return Response.json(
        { ok: false, error: "Submission rejected." },
        { status: 400 }
      );
    }

    const isSiteMode = mode === "site" && Array.isArray(locationPayloads) && locationPayloads.length > 0;
    const hasImages = isSiteMode
      ? locationPayloads.some((l) => Object.values(l.images ?? {}).some(Boolean))
      : Object.values(singleImages).some(Boolean);

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

    if (isSiteMode) {
      for (const loc of locationPayloads) {
        const locName = String(loc.name || "Unnamed Location").trim();
        const locMeta = [loc.locType, loc.structureRel].filter(Boolean).join(", ");
        for (const [slot, label] of Object.entries(slotLabels)) {
          if (loc.images?.[slot]) {
            content.push({
              type: "image",
              source: {
                type: "base64",
                media_type: sanitizeMime(loc.mimeTypes?.[slot] ?? "image/jpeg"),
                data: loc.images[slot],
              },
            });
            content.push({
              type: "text",
              text: `[Above image: ${locName}${locMeta ? ` (${locMeta})` : ""} — ${label}]`,
            });
          }
        }
      }
    } else {
      for (const [slot, label] of Object.entries(slotLabels)) {
        if (singleImages[slot]) {
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: sanitizeMime(singleMimeTypes[slot] ?? "image/jpeg"),
              data: singleImages[slot],
            },
          });
          content.push({
            type: "text",
            text: `[Above image: ${label}]`,
          });
        }
      }
    }

    const locationNames = isSiteMode
      ? locationPayloads.map((l) => {
          const meta = [l.locType, l.structureRel].filter(Boolean).join(", ");
          return `${l.name || "Unnamed"}${meta ? ` (${meta})` : ""}`;
        }).join("; ")
      : null;

    const contextLines: string[] = [
      `Client: ${String(name).trim() || "Not provided"}`,
      `Site address: ${String(address).trim() || "Not provided"}`,
      `Environment: ${environment}`,
      `Location type: ${locationType || "Not specified"}`,
      `Client's Wi-Fi network name (SSID): ${String(client_ssid).trim() || "Not provided"} — use this to identify their router in the scan data`,
      `MULTI_SSID: ${multiSsid ? "true" : "false"}`,
      ...(multiSsid && ssidDescription?.trim() ? [`SSID_DESCRIPTION: ${ssidDescription.trim()}`] : []),
      ...(isSiteMode && locationNames ? [`Locations surveyed (${locationPayloads.length}): ${locationNames}`] : []),
      ...(isSiteMode ? ["ANALYSIS MODE: Full Site Survey — synthesize patterns ACROSS all locations for a site-wide assessment."] : []),
      ...(isHybrid ? [
        "",
        `HYBRID PROPERTY SURVEY — ${detachedCount} detached structure(s) present.`,
        `Site overview: ${String(siteOverview).trim() || "Not provided"}`,
        "CRITICAL REQUIREMENT: You MUST include a 'cross_structure_analysis' object in your JSON response with these exact keys:",
        "  - threshold_analysis: describe signal strength and behavior at thresholds/doorways between each pair of structures (2-3 sentences)",
        "  - bridge_feasibility: assess whether current equipment can bridge the structures; what is missing (2-3 sentences)",
        "  - recommended_placement: specific locations to place access points or wireless bridges to fix cross-structure coverage (2-3 sentences)",
        "  - powerline_moca: whether powerline adapters (Ethernet over power lines) or MoCA adapters (Ethernet over coax) would help, and when to use each (2-3 sentences)",
        "  - cost_estimate: realistic cost range in USD for the recommended solution (equipment only; e.g. '$80-$150 for a wireless access point, $60-$120 for a powerline adapter kit') (1-2 sentences)",
        "  - corvus_assessment: 2-3 sentences in Corvus' voice summarizing the overall cross-structure coverage situation and the single most important action",
        "All cross_structure_analysis values must be plain text strings in Corvus' voice.",
      ] : []),
      `IT_COMFORT_LEVEL: ${itComfortLevel}`,
      `IT_COMFORT_LABEL: ${["Just make it work","Basic user","Somewhat technical","IT Proficient","Network Pro"][Math.max(0, Math.min(4, (itComfortLevel as number) - 1))]}`,
      ...(notes?.trim() ? [
        "",
        "CLIENT REPORTED SYMPTOMS:",
        notes.trim(),
        "IMPORTANT: Cross-reference your findings against these reported symptoms. If you identify issues that directly explain what the client described — call that out explicitly in the finding description. Lead with findings most likely to explain the reported problem.",
      ] : [
        `Problem description: Not provided`,
      ]),
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
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
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
