/**
 * Sidebar Component
 * Navigation sidebar for dashboard
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  List,
  QrCode,
  Settings,
  CalendarX,
  X,
} from 'lucide-react';

const navItems = [
  {
    name: 'Home',
    href: '',
    icon: LayoutDashboard,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Bookings',
    href: '/bookings',
    icon: List,
  },
  {
    name: 'QR Code',
    href: '/qr-code',
    icon: QrCode,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Holiday Hours',
    href: '/holiday-hours',
    icon: CalendarX,
  },
];

export default function Sidebar({ businessId, isOpen, onClose }) {
  const pathname = usePathname();

  const isActive = (href) => {
    const fullPath = `/dashboard/${businessId}${href}`;
    if (href === '') {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 flex-shrink-0">
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
                alt="Kitsune"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kitsune
              </h1>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={`/dashboard/${businessId}${item.href}`}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    active
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
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
                alt="Kitsune"
                className="w-5 h-5 rounded object-cover"
              />
              <span>Kitsune Booking</span>
            </div>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
