/**
 * Client wrapper for BrochurePage
 * Uses dynamic import to prevent hydration mismatches from Framer Motion animations
 */
'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false to prevent hydration mismatches
// The "bailout" error in development HTML source is expected and won't appear in production
const BrochureV2Content = dynamic(
  () => import('@/components/brochure-v2/BrochureV2Content'),
  { ssr: false }
);

export default function BrochureWrapper() {
  return <BrochureV2Content />;
}
