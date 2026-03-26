export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeBase, updateKnowledgeBase } from '@/lib/corvus-knowledge'

export async function POST(request: NextRequest) {
  // Accept admin key header OR Vercel cron secret
  const adminKey    = request.headers.get('x-admin-key')
  const cronHeader  = request.headers.get('x-vercel-cron')
  const cronSecret  = process.env.CRON_SECRET

  const isAdmin  = adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY
  const isCron   = cronHeader === '1' && cronSecret && cronHeader !== null

  if (!isAdmin && !isCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Pull current RF/Wi-Fi developments via Anthropic with web search
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Search for the latest developments in Wi-Fi technology, RF communications, wireless networking standards, and emerging wireless technologies published in the last 90 days. Include: new IEEE 802.11 standard updates, Wi-Fi 7 deployment news, 6 GHz band developments, private 5G/CBRS news, Wi-Fi security vulnerabilities, new interference sources, regulatory changes affecting RF spectrum, and any significant enterprise Wi-Fi developments. Format as a structured knowledge update that can be appended to a technical RF knowledge base. Be specific with dates, standards numbers, and technical specifications.`,
        }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('[knowledge/update] Anthropic error:', response.status, errText)
      return NextResponse.json({ error: `Anthropic API error: ${response.status}` }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await response.json() as any
    const updateContent: string = (data.content ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.type === 'text' ? (item.text as string) : '')
      .filter(Boolean)
      .join('\n')

    if (!updateContent) {
      return NextResponse.json({ error: 'No content returned from search' }, { status: 500 })
    }

    // Append to existing knowledge base
    const existing = await getKnowledgeBase()
    const updated = `${existing}\n\nQUARTERLY UPDATE — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}:\n${updateContent}`
    await updateKnowledgeBase(updated)

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      preview: updateContent.substring(0, 300) + (updateContent.length > 300 ? '...' : ''),
    })

  } catch (error) {
    console.error('[knowledge/update] failed:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
