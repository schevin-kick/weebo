import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  // Dynamic base URL for metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.weebo.io');

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('metadata.title'),
      template: `%s | Weebo`,
    },
    description: t('metadata.description'),
    keywords: t('metadata.keywords'),
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    other: {
      'geo.region': t('metadata.geoRegion'),
      'geo.placename': t('metadata.geoPlacename'),
      'geo.position': '25.0330;121.5654',
      ...(process.env.NEXT_PUBLIC_FB_APP_ID && {
        'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID,
      }),
    },
    openGraph: {
      title: t('metadata.ogTitle'),
      description: t('metadata.ogDescription'),
      type: 'website',
      url: `${baseUrl}/${locale}`,
      locale: locale === 'zh-tw' ? 'zh_TW' : 'en_US',
      siteName: 'Weebo',
      images: [
        {
          url: '/brochure/og-image.png',
          width: 1200,
          height: 630,
          alt: t('metadata.ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: t('metadata.twitterSite'),
      creator: t('metadata.twitterCreator'),
      title: t('metadata.twitterTitle'),
      description: t('metadata.twitterDescription'),
      images: {
        url: '/brochure/og-image.png',
        alt: t('metadata.ogImageAlt'),
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh-tw': '/zh-tw',
      },
    },
    applicationName: 'Weebo',
    appleWebApp: {
      capable: true,
      title: 'Weebo',
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            {children}
          </ToastProvider>
          <div id="modal-root" />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
