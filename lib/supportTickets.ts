import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'
import nodemailer from 'nodemailer'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export type TicketPriority = 'critical' | 'high' | 'normal'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketProduct = 'corvus_verdict' | 'full_reckoning' | 'dashboard' | 'subscription' | 'pdf' | 'other'

export type SupportTicket = {
  id: string
  createdAt: number
  updatedAt: number
  status: TicketStatus
  priority: TicketPriority
  product: TicketProduct
  description: string
  screenshotUrls: string[]
  submitterEmail: string
  submitterName?: string
  authKey?: string
  tier?: string
  adminNotes?: string
  resolvedAt?: number
}

const TICKET_PREFIX = 'ticket:'
const TICKET_INDEX = 'tickets:index'

function autoDetectPriority(description: string): TicketPriority {
  const lower = description.toLowerCase()
  const criticalKeywords = ["can't login", 'cant login', 'no access', 'payment', 'charged', 'stripe', 'not working at all', 'completely broken', 'data loss']
  const highKeywords = ['error', 'failed', 'crash', 'broken', 'wrong', 'incorrect', 'missing']
  if (criticalKeywords.some(k => lower.includes(k))) return 'critical'
  if (highKeywords.some(k => lower.includes(k))) return 'high'
  return 'normal'
}

export async function createTicket(
  data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'priority' | 'status'>
): Promise<SupportTicket> {
  const id = 'OCWS-TKT-' + nanoid(8).toUpperCase()
  const now = Date.now()
  const priority = autoDetectPriority(data.description)

  const ticket: SupportTicket = {
    id,
    createdAt: now,
    updatedAt: now,
    status: 'open',
    priority,
    ...data,
  }

  await redis.set(TICKET_PREFIX + id, JSON.stringify(ticket))
  await redis.zadd(TICKET_INDEX, { score: now, member: id })
  await sendTicketEmail(ticket)

  return ticket
}

export async function listTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  const members = await redis.zrange(TICKET_INDEX, 0, -1, { rev: true })
  const tickets: SupportTicket[] = []
  for (const id of members) {
    const raw = await redis.get<string>(TICKET_PREFIX + id)
    if (!raw) continue
    const t: SupportTicket = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (status && t.status !== status) continue
    tickets.push(t)
  }
  return tickets
}

export async function updateTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> {
  const raw = await redis.get<string>(TICKET_PREFIX + id)
  if (!raw) return null
  const ticket: SupportTicket = typeof raw === 'string' ? JSON.parse(raw) : raw
  const updated = { ...ticket, ...updates, updatedAt: Date.now() }
  if (updates.status === 'resolved') updated.resolvedAt = Date.now()
  await redis.set(TICKET_PREFIX + id, JSON.stringify(updated))
  return updated
}

export async function getOpenTicketCount(): Promise<number> {
  const tickets = await listTickets('open')
  return tickets.length
}

export async function getCriticalTicketCount(): Promise<number> {
  const tickets = await listTickets('open')
  return tickets.filter(t => t.priority === 'critical').length
}

async function sendTicketEmail(ticket: SupportTicket) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    const priorityEmoji = ticket.priority === 'critical' ? '🚨' : ticket.priority === 'high' ? '⚠️' : '📋'

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'joshua@oldcrowswireless.com',
      subject: `${priorityEmoji} [${ticket.priority.toUpperCase()}] Support Ticket ${ticket.id}`,
      html: `
        <div style="font-family: monospace; background: #0D1520; color: #F4F6F8; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00C2C7;">OCWS Support Ticket</h2>
          <p><strong>ID:</strong> ${ticket.id}</p>
          <p><strong>Priority:</strong> <span style="color: ${ticket.priority === 'critical' ? '#e05555' : ticket.priority === 'high' ? '#B8922A' : '#00C2C7'}">${ticket.priority.toUpperCase()}</span></p>
          <p><strong>Product:</strong> ${ticket.product}</p>
          <p><strong>From:</strong> ${ticket.submitterEmail}</p>
          <p><strong>Description:</strong></p>
          <blockquote style="border-left: 3px solid #00C2C7; padding-left: 12px; color: #aaa;">${ticket.description}</blockquote>
          <a href="https://oldcrowswireless.com/dashboard?tab=tickets" style="background: #0D6E7A; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View in Dashboard →</a>
        </div>
      `,
    })
  } catch (e) {
    console.error('Ticket email failed:', e)
  }
}
