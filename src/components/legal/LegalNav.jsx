'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FileText, Shield } from 'lucide-react';

export default function LegalNav() {
  const t = useTranslations('legal');
  const pathname = usePathname();

  const navItems = [
    {
      href: '/legal/privacy',
      label: t('nav.privacy'),
      icon: Shield
    },
    {
      href: '/legal/terms',
      label: t('nav.terms'),
      icon: FileText
    }
  ];

  return (
    <nav className="flex gap-4 mb-8 flex-wrap">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.includes(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
              ${isActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'bg-white/10 backdrop-blur-lg border border-white/20 text-slate-200 hover:bg-white/20'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
