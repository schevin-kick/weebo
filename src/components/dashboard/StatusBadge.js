/**
 * StatusBadge Component
 * Color-coded status badges for bookings
 */

'use client';

import { useTranslations } from 'next-intl';

export default function StatusBadge({ status }) {
  const t = useTranslations('common.status');

  const statusConfig = {
    pending: {
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    confirmed: {
      classes: 'bg-green-100 text-green-800 border-green-200',
    },
    cancelled: {
      classes: 'bg-red-100 text-red-800 border-red-200',
    },
    completed: {
      classes: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {t(status || 'pending')}
    </span>
  );
}
