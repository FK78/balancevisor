import { adminDb } from '@/db/rls-context';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const start = Date.now();
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
      database: { status: 'ok' | 'error'; latency?: number; error?: string };
      memory: { status: 'ok'; usage: number };
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'ok' },
      memory: { status: 'ok', usage: process.memoryUsage().heapUsed / 1024 / 1024 },
    },
  };

  // Test database connection with a simple query
  try {
    const dbStart = Date.now();
    await adminDb.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;
    health.checks.database.latency = dbLatency;
  } catch (error) {
    health.status = 'degraded';
    health.checks.database.status = 'error';
    health.checks.database.error = process.env.NODE_ENV === 'production'
      ? 'Database connection failed'
      : (error instanceof Error ? error.message : String(error));
  }

  // Determine overall status
  if (health.checks.database.status === 'error') {
    health.status = 'unhealthy';
  }

  const totalLatency = Date.now() - start;
  const headers = {
    'Content-Type': 'application/json',
    'X-Response-Time': `${totalLatency}ms`,
  };

  return NextResponse.json(health, {
    status: health.status === 'unhealthy' ? 503 : 200,
    headers,
  });
}

// Allow HEAD requests as well
export const HEAD = GET;