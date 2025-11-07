/**
 * Client wrapper for BrochurePage
 * Uses dynamic import with SSR enabled and a loading fallback
 * to ensure proper SEO metadata while preventing hydration issues
 */
'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR enabled and loading fallback
// This ensures server-side rendering for SEO while handling client-side hydration gracefully
const BrochureV2Content = dynamic(
  () => import('@/components/brochure-v2/BrochureV2Content'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ),
    ssr: true // Enable SSR for proper SEO metadata
  }
);

export default function BrochureWrapper({ pricingConfig }) {
  return <BrochureV2Content pricingConfig={pricingConfig} />;
}
