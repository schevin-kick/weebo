import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh-tw'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Prefix strategy for locale in URLs
  localePrefix: 'always', // Always show locale in URL: /en/dashboard, /zh-tw/dashboard
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
