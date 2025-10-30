import { redirect } from 'next/navigation';
import { clearSession } from '@/lib/auth';

/**
 * GET /api/auth/logout
 * Clears session and redirects to home page
 */
export async function GET() {
  await clearSession();
  redirect('/');
}
