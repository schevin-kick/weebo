import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Returns current session data
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: session });
}
