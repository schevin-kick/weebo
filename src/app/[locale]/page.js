/**
 * Home Page
 * Shows brochure to non-authenticated users, redirects authenticated users to dashboard
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BrochureWrapper from '@/components/home/BrochureWrapper';
import AuthenticatedRedirect from '@/components/home/AuthenticatedRedirect';

export default async function Home() {
  // Check authentication server-side
  const session = await getSession();

  // Not logged in - show brochure immediately (no loading flash!)
  if (!session) {
    return <BrochureWrapper />;
  }

  // User is authenticated - fetch businesses server-side
  let businesses;
  try {
    businesses = await prisma.business.findMany({
      where: {
        ownerId: session.id,
        isActive: true,
      },
      select: {
        id: true,
        businessName: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    // On database error, show brochure
    return <BrochureWrapper />;
  }

  // Redirect based on business count
  if (businesses.length === 0) {
    // No businesses - go to setup to create first one
    redirect('/setup');
  } else if (businesses.length === 1) {
    // One business - go directly to dashboard
    redirect(`/dashboard/${businesses[0].id}`);
  } else {
    // Multiple businesses - need to check localStorage for last selected
    // This requires client-side component since localStorage is browser-only
    return <AuthenticatedRedirect businesses={businesses} userId={session.id} />;
  }
}
