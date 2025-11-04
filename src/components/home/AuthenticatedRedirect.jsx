/**
 * Client component for handling authenticated redirects
 * Only used when user has multiple businesses and we need to check localStorage
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLastSelectedBusiness } from '@/lib/localStorage';

export default function AuthenticatedRedirect({ businesses, userId }) {
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for last selected business
    const lastSelected = getLastSelectedBusiness(userId);

    if (lastSelected && businesses.some((b) => b.id === lastSelected)) {
      router.push(`/dashboard/${lastSelected}`);
    } else {
      // No last selected or not in list - redirect to first business
      router.push(`/dashboard/${businesses[0].id}`);
    }
  }, [businesses, userId, router]);

  // Return null - the redirect happens via useEffect
  // No loading UI needed since this executes immediately
  return null;
}
