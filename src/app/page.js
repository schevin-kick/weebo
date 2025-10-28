/**
 * Home Page
 * Automatically redirects based on user context with cute loading animation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FallingSakura from '@/components/background/FallingSakura';
import KitsuneLogo from '@/components/loading/KitsuneLogo';
import { getLastSelectedBusiness } from '@/lib/localStorage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      try {
        // Check authentication
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        // Not logged in - redirect to login
        if (!sessionData.user) {
          window.location.href = '/api/auth/login';
          return;
        }

        // Load businesses
        const bizRes = await fetch('/api/businesses');
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
          // Multiple businesses - check last selected or go to picker
          const lastSelected = getLastSelectedBusiness(sessionData.user.id);
          if (lastSelected && businesses.some((b) => b.id === lastSelected)) {
            router.push(`/dashboard/${lastSelected}`);
          } else {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Redirect error:', error);
        // On error, go to setup
        router.push('/setup');
      }
    }

    handleRedirect();
  }, [router]);

  return (
    <>
      <FallingSakura />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
        <div className="text-center">
          {/* Cute Animated Fox Logo */}
          <KitsuneLogo size="large" />

          {/* Brand Name */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-8 mb-2">
            Kitsune Booking
          </h1>
          <p className="text-slate-500">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    </>
  );
}
