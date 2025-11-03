/**
 * DashboardLayout Component
 * Main layout for dashboard pages with sidebar and navbar
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import BusinessPicker from './BusinessPicker';
import FallingSakura from '@/components/background/FallingSakura';

export default function DashboardLayout({
  children,
  user,
  businesses,
  currentBusinessId,
}) {
  const t = useTranslations('dashboard.header');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <>
      <FallingSakura />

      {/* Modal Portal Container - renders outside main DOM hierarchy with highest z-index */}
      <div id="modal-root" className="relative z-[9999]" />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex">
        {/* Sidebar */}
        <Sidebar
          businessId={currentBusinessId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 h-[73px] flex items-center">
              <div className="flex items-center justify-between w-full">
                {/* Left side */}
                <div className="flex items-center gap-4">
                  {/* Menu button - only show on mobile */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Menu className="w-6 h-6" />
                  </button>

                  {/* Business Picker */}
                  <BusinessPicker
                    businesses={businesses}
                    currentBusinessId={currentBusinessId}
                  />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                  {/* User menu */}
                  {user && (
                    <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                      <div className="hidden sm:flex items-center gap-2">
                        {user.pictureUrl && (
                          <img
                            src={user.pictureUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium text-slate-700">
                          {user.displayName}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('logout')}
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
