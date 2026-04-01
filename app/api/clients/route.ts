import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'follow-up' | 'closed';
  notes: string;
  reportIds: string[];
  createdAt: string;
  updatedAt: string;
}

function clientKey(code: string, clientId: string) {
  return `clients:${code}:${clientId}`;
}

function clientIndexKey(code: string) {
  return `clients:${code}:index`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  try {
    const index: string[] = (await redis.smembers(clientIndexKey(code))) || [];
    if (!index.length) return NextResponse.json({ clients: [] });

    const pipeline = redis.pipeline();
    index.forEach(id => pipeline.get(clientKey(code, id)));
    const results = await pipeline.exec();

    const clients = results
      .map(r => r as Client | null)
      .filter(Boolean) as Client[];

    clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ clients });
  } catch (err) {
    console.error('[clients GET]', err);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, client } = await req.json();
    if (!code || !client?.name) return NextResponse.json({ error: 'Code and name required' }, { status: 400 });

    const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newClient: Client = {
      id, name: client.name, email: client.email || '',
      phone: client.phone || '', company: client.company || '',
      address: client.address || '', status: client.status || 'active',
      notes: client.notes || '', reportIds: client.reportIds || [],
      createdAt: now, updatedAt: now,
    };

    await redis.set(clientKey(code, id), JSON.stringify(newClient));
    await redis.sadd(clientIndexKey(code), id);

    return NextResponse.json({ client: newClient });
  } catch (err) {
    console.error('[clients POST]', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { code, clientId, updates } = await req.json();
    if (!code || !clientId) return NextResponse.json({ error: 'Code and clientId required' }, { status: 400 });

    const existing = await redis.get<Client>(clientKey(code, clientId));
    if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const updated: Client = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await redis.set(clientKey(code, clientId), JSON.stringify(updated));

    return NextResponse.json({ client: updated });
  } catch (err) {
    console.error('[clients PATCH]', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { code, clientId } = await req.json();
    if (!code || !clientId) return NextResponse.json({ error: 'Code and clientId required' }, { status: 400 });

    await redis.del(clientKey(code, clientId));
    await redis.srem(clientIndexKey(code), clientId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[clients DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
