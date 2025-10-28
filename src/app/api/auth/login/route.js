import { redirect } from 'next/navigation';
import { getLINELoginUrl } from '@/lib/auth';

/**
 * GET /api/auth/login
 * Initiates LINE Login flow
 */
export async function GET() {
  const lineLoginUrl = getLINELoginUrl();
  redirect(lineLoginUrl);
}
