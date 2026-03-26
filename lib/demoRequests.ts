import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'
import nodemailer from 'nodemailer'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export type DemoRequestStatus = 'new' | 'contacted' | 'converted' | 'closed'

export type DemoRequest = {
  id: string
  createdAt: number
  status: DemoRequestStatus
  name: string
  email: string
  company?: string
  problem?: string
  contactMethod: 'email' | 'phone' | 'either'
  phone?: string
  sentDemoUrl?: string
  adminNotes?: string
}

const REQ_PREFIX = 'demo:request:'
const REQ_INDEX = 'demo:requests:index'

export async function createDemoRequest(
  data: Omit<DemoRequest, 'id' | 'createdAt' | 'status'>
): Promise<DemoRequest> {
  const id = 'OCWS-DEMO-REQ-' + nanoid(8).toUpperCase()
  const now = Date.now()

  const request: DemoRequest = {
    id,
    createdAt: now,
    status: 'new',
    ...data,
  }

  await redis.set(REQ_PREFIX + id, JSON.stringify(request))
  await redis.zadd(REQ_INDEX, { score: now, member: id })
  await sendDemoRequestEmail(request)

  return request
}

export async function listDemoRequests(status?: DemoRequestStatus): Promise<DemoRequest[]> {
  const members = await redis.zrange(REQ_INDEX, 0, -1, { rev: true })
  const requests: DemoRequest[] = []
  for (const id of members) {
    const raw = await redis.get<string>(REQ_PREFIX + id)
    if (!raw) continue
    const r: DemoRequest = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (status && r.status !== status) continue
    requests.push(r)
  }
  return requests
}

export async function updateDemoRequest(id: string, updates: Partial<DemoRequest>): Promise<DemoRequest | null> {
  const raw = await redis.get<string>(REQ_PREFIX + id)
  if (!raw) return null
  const req: DemoRequest = typeof raw === 'string' ? JSON.parse(raw) : raw
  const updated = { ...req, ...updates }
  await redis.set(REQ_PREFIX + id, JSON.stringify(updated))
  return updated
}

export async function getNewDemoRequestCount(): Promise<number> {
  const all = await listDemoRequests('new')
  return all.length
}

async function sendDemoRequestEmail(req: DemoRequest) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'joshua@oldcrowswireless.com',
      subject: `🎯 New Demo Request — ${req.name}${req.company ? ` (${req.company})` : ''}`,
      html: `
        <div style="font-family: monospace; background: #0D1520; color: #F4F6F8; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00C2C7;">New Demo Request</h2>
          <p><strong>ID:</strong> ${req.id}</p>
          <p><strong>Name:</strong> ${req.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${req.email}" style="color: #00C2C7;">${req.email}</a></p>
          ${req.company ? `<p><strong>Company/Property:</strong> ${req.company}</p>` : ''}
          ${req.phone ? `<p><strong>Phone:</strong> ${req.phone}</p>` : ''}
          <p><strong>Preferred Contact:</strong> ${req.contactMethod}</p>
          ${req.problem ? `<p><strong>What they're trying to solve:</strong></p><blockquote style="border-left: 3px solid #00C2C7; padding-left: 12px; color: #aaa;">${req.problem}</blockquote>` : ''}
          <a href="https://oldcrowswireless.com/dashboard?tab=demo-requests" style="background: #0D6E7A; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 12px;">View in Dashboard →</a>
        </div>
      `,
    })
  } catch (e) {
    console.error('Demo request email failed:', e)
  }
}
