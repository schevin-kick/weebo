import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/session
 * Returns current session data
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('weebo_session');

  console.log(`[Session] Cookie present: ${sessionCookie ? 'yes' : 'no'}`);
  if (sessionCookie) {
    console.log(`[Session] Cookie value length: ${sessionCookie.value.length}`);
  }

  const session = await getSession();

  if (!session) {
    console.log('[Session] No valid session found, returning 401');
    return NextResponse.json({ user: null }, { status: 401 });
  }

  console.log(`[Session] Valid session found for user ${session.id}`);
  return NextResponse.json({ user: session });
}
