/**
 * Trial Banner Component
 * Shows trial countdown and prompts user to subscribe
 * Only displays when user is in trial period
 */

'use client';

import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export default function TrialBanner({ subscription }) {
  // Only show for trialing users
  if (subscription?.status !== 'trialing') {
    return null;
  }

  const daysLeft = subscription.daysLeft || 0;
  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`
        ${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}
        border-b px-4 py-3
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Message */}
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}

          <p
            className={`text-sm font-medium ${
              isUrgent ? 'text-orange-900' : 'text-blue-900'
            }`}
          >
            {isUrgent ? (
              <>
                Trial ends in{' '}
                <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>!
                Subscribe now to keep your business running smoothly.
              </>
            ) : (
              <>
                Free trial:{' '}
                <span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>{' '}
                remaining
              </>
            )}
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/dashboard/billing"
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0
            ${
              isUrgent
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isUrgent ? 'Subscribe Now' : 'View Billing'}
        </Link>
      </div>
    </div>
  );
}
