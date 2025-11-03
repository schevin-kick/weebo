/**
 * Home Page
 * Shows brochure to non-authenticated users, redirects authenticated users to dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FallingSakura from '@/components/background/FallingSakura';
import KitsuneLogo from '@/components/loading/KitsuneLogo';
import { getLastSelectedBusiness } from '@/lib/localStorage';
import dynamic from 'next/dynamic';

// Dynamically import brochure to reduce initial bundle size
const BrochurePage = dynamic(() => import('./brochure/page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="animate-pulse text-white">Loading...</div>
    </div>
  )
});

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function handleRedirect() {
      try {
        // Check authentication
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        // Not logged in - show brochure
        if (!sessionData.user) {
          setIsAuthenticated(false);
          return;
        }

        // User is authenticated - redirect to dashboard
        setIsAuthenticated(true);

        // Load businesses
        const bizRes = await fetch('/api/businesses/list');
        const bizData = await bizRes.json();
        const businesses = bizData.businesses || [];

        // Redirect based on business count
        if (businesses.length === 0) {
          // No businesses - go to setup to create first one
          router.push('/setup');
        } else if (businesses.length === 1) {
          // One business - go directly to dashboard
          router.push(`/dashboard/${businesses[0].id}`);
        } else {
          // Multiple businesses - always redirect to last selected or first business
          const lastSelected = getLastSelectedBusiness(sessionData.user.id);
          if (lastSelected && businesses.some((b) => b.id === lastSelected)) {
            router.push(`/dashboard/${lastSelected}`);
          } else {
            // No last selected - redirect to first business
            router.push(`/dashboard/${businesses[0].id}`);
          }
        }
      } catch (error) {
        console.error('Redirect error:', error);
        // On error, show brochure
        setIsAuthenticated(false);
      }
    }

    handleRedirect();
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <>
        <FallingSakura />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
          <div className="text-center">
            <KitsuneLogo size="large" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-8 mb-2">
              Kitsune
            </h1>
            <p className="text-slate-500">
              Loading...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Show brochure for non-authenticated users
  if (isAuthenticated === false) {
    return <BrochurePage />;
  }

  // Show loading for authenticated users while redirecting
  return (
    <>
      <FallingSakura />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
        <div className="text-center">
          <KitsuneLogo size="large" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-8 mb-2">
            Kitsune
          </h1>
          <p className="text-slate-500">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    </>
  );
}
