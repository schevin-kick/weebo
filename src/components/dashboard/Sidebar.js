/**
 * Sidebar Component
 * Navigation sidebar for dashboard
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import { version } from '../../../package.json';
import {
  LayoutDashboard,
  Calendar,
  List,
  QrCode,
  Settings,
  CalendarX,
  BarChart3,
  MessageSquare,
  CreditCard,
  Bell,
  X,
} from 'lucide-react';

export default function Sidebar({ businessId, isOpen, onClose }) {
  const t = useTranslations('dashboard.sidebar');

  const navItems = [
    {
      name: t('navigation.home'),
      href: '',
      icon: LayoutDashboard,
    },
    {
      name: t('navigation.analytics'),
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: t('navigation.calendar'),
      href: '/calendar',
      icon: Calendar,
    },
    {
      name: t('navigation.bookings'),
      href: '/bookings',
      icon: List,
    },
    {
      name: t('navigation.qrCode'),
      href: '/qr-code',
      icon: QrCode,
    },
    {
      name: t('navigation.settings'),
      href: '/settings',
      icon: Settings,
    },
    {
      name: t('navigation.billing'),
      href: '/billing',
      icon: CreditCard,
    },
    {
      name: t('navigation.messaging'),
      href: '/messaging',
      icon: MessageSquare,
    },
    {
      name: t('navigation.notifications'),
      href: '/notifications',
      icon: Bell,
    },
    {
      name: t('navigation.holidayHours'),
      href: '/holiday-hours',
      icon: CalendarX,
    },
  ];
  const pathname = usePathname();
  const { showBadge: showMessagingBadge } = useNotificationBadge('messaging', businessId);
  const { showBadge: showNotificationsBadge } = useNotificationBadge('notifications', businessId);

  const isActive = (href) => {
    // Extract locale from pathname (e.g., '/en' from '/en/dashboard/...')
    const locale = pathname.split('/')[1];
    const fullPath = `/${locale}/dashboard/${businessId}${href}`;
    if (href === '') {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <>
      {/* Backdrop - only show on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50
          transform transition-transform duration-300 ease-in-out lg:transform-none
          flex flex-col flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button - only show on mobile */}
        <div className="flex justify-end p-4 flex-shrink-0 lg:hidden">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="px-6 border-b border-slate-200 flex-shrink-0 h-[73px] flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt={t('logo')}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {t('logo')}
              </h1>
              <p className="text-xs text-slate-500">{t('title')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showBadge =
              (item.name === 'Messaging' && showMessagingBadge) ||
              (item.name === 'Notifications' && showNotificationsBadge);

            // Billing is account-wide, not business-specific
            const href = item.name === 'Billing'
              ? '/dashboard/billing'
              : `/dashboard/${businessId}${item.href}`;

            return (
              <Link
                key={item.name}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                  ${active
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>

                {/* Notification Badge */}
                {showBadge && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <div className="text-xs text-slate-500 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img
                src="/logo.png"
                alt={t('logo')}
                className="w-5 h-5 rounded object-cover"
              />
              <span>{t('logo')}</span>
            </div>
            <p className="mt-1">v{version}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
