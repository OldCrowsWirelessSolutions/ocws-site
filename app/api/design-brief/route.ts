import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionCode, tier, floorPlanBase64, floorPlanMimeType, scanData, locationInfo } = body;

    if (!subscriptionCode) {
      return NextResponse.json({ error: 'Subscription code required' }, { status: 401 });
    }

    if (!['murder', 'vip'].includes(tier?.toLowerCase())) {
      return NextResponse.json({ error: 'Wireless Design Brief requires Murder tier or higher.' }, { status: 403 });
    }

    const systemPrompt = `You are Corvus — an AI RF intelligence engine built by Old Crows Wireless Solutions. You are producing a Wireless Design Brief: a professional AP placement and coverage strategy document based on a floor plan image and wireless scan data.

Return ONLY valid JSON. No markdown. No preamble. No text outside the JSON object.

JSON structure:
{
  "executiveSummary": "2-3 sentence Corvus-voice summary of the wireless environment and what needs to happen",
  "floorPlanObservations": ["observation about layout", "dead zone risk", "interference source noted"],
  "apRecommendations": [
    {
      "location": "descriptive placement location",
      "band": "Dual-band | 2.4GHz | 5GHz | 6GHz",
      "apType": "Ceiling-mount | Wall-mount | Desktop",
      "reason": "why this placement solves a specific problem",
      "priority": "Primary | Secondary | Optional",
      "coverageRadius": "estimated radius in feet"
    }
  ],
  "channelStrategy": {
    "band24": "channel plan for 2.4GHz",
    "band5": "channel plan for 5GHz",
    "txPower": "recommended TX power guidance",
    "notes": "roaming, BSS coloring, or other notes"
  },
  "coverageZones": [
    {
      "zone": "zone or room name",
      "riskLevel": "Low | Medium | High | Critical",
      "assessment": "current or anticipated coverage situation",
      "recommendation": "specific action"
    }
  ],
  "interferenceRisks": ["risk 1", "risk 2"],
  "criticalFindings": ["finding 1", "finding 2"],
  "estimatedAPCount": 0,
  "hardwareNotes": "any hardware tier or vendor guidance",
  "corvusVerdict": "Corvus closing statement — full character, no hedging"
}`;

    const userContent: Anthropic.MessageParam['content'] = [];

    if (floorPlanBase64) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: floorPlanMimeType || 'image/jpeg',
          data: floorPlanBase64,
        },
      });
    }

    userContent.push({
      type: 'text',
      text: `Location Name: ${locationInfo?.name || 'Not provided'}
Location Type: ${locationInfo?.type || 'Not provided'}
Square Footage: ${locationInfo?.sqft || 'Not provided'}
Stories/Floors: ${locationInfo?.stories || 'Not provided'}
Construction Type: ${locationInfo?.construction || 'Not provided'}
Notes: ${locationInfo?.notes || 'None'}

Wireless Scan Data:
${scanData || 'No scan data provided — base recommendations on floor plan analysis only.'}

Analyze the floor plan image and scan data. Produce the Design Brief JSON. Return only the JSON object.`,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('');

    const clean = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(clean);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[design-brief] error:', err);
    return NextResponse.json({ error: 'Analysis failed. Check server logs.' }, { status: 500 });
  }
}
