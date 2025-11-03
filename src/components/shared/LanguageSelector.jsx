'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const locales = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-tw', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
];

export default function LanguageSelector({ className = '', variant = 'dark' }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  // Variant styles
  const buttonStyles = variant === 'light'
    ? 'bg-white/80 hover:bg-white border-gray-300 text-gray-800'
    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const switchLocale = (newLocale) => {
    setIsOpen(false);

    // Update the cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Navigate to the new locale
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all shadow-sm ${buttonStyles}`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLocale.flag}</span>
        <span className="text-sm font-medium">{currentLocale.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => switchLocale(loc.code)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                loc.code === locale
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{loc.flag}</span>
                  <span>{loc.nativeName}</span>
                </div>
                {loc.code === locale && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {loc.code !== locale && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-8">{loc.name}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
