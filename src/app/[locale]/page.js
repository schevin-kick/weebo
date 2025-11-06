/**
 * Home Page
 * Shows brochure to non-authenticated users, redirects authenticated users to dashboard
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BrochureWrapper from '@/components/home/BrochureWrapper';
import AuthenticatedRedirect from '@/components/home/AuthenticatedRedirect';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  // Dynamic base URL for metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://weebo-ten.vercel.app');

  return {
    title: t('metadata.title'),
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
    },
    openGraph: {
      title: t('metadata.ogTitle'),
      description: t('metadata.ogDescription'),
      type: 'website',
      url: `${baseUrl}/${locale}`,
      locale: locale === 'zh-tw' ? 'zh_TW' : 'en_US',
      siteName: 'Weebo',
      publishedTime: '2024-01-01T00:00:00Z',
      modifiedTime: new Date().toISOString(),
      images: [
        {
          url: `${baseUrl}/brochure/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('metadata.ogImageAlt'),
        },
        {
          url: `${baseUrl}/brochure/og-image.png`,
          width: 1200,
          height: 1200,
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
        url: `${baseUrl}/brochure/og-image.png`,
        alt: t('metadata.ogImageAlt'),
      },
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
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
    ],
  };
}

export default async function Home({ params }) {
  // Check authentication server-side
  const session = await getSession();

  // Not logged in - show brochure immediately (no loading flash!)
  if (!session) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'brochureV2' });

    // Dynamic base URL that works in all environments
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://weebo-ten.vercel.app');

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': ['SoftwareApplication', 'Product'],
      '@id': `${baseUrl}/#software`,
      name: 'Weebo',
      alternateName: 'Kitsune Booking',
      description: t('metadata.schemaDescription'),
      url: baseUrl,
      image: `${baseUrl}/brochure/og-image.png`,
      logo: `${baseUrl}/logo.png`,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Appointment Scheduling',
      operatingSystem: 'Web, LINE, iOS, Android',
      softwareVersion: '2.0',
      releaseNotes: locale === 'zh-tw'
        ? '增強的 LINE 整合、即時分析、多語言支援'
        : 'Enhanced LINE integration, Real-time analytics, Multi-language support',
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      offers: {
        '@type': 'Offer',
        price: '200',
        priceCurrency: 'TWD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Weebo'
        },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '200',
          priceCurrency: 'TWD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitText: 'MONTH'
          }
        },
        description: locale === 'zh-tw'
          ? '月費方案，包含所有功能，14 天免費試用'
          : 'Monthly plan with all features, 14-day free trial'
      },
      additionalOffers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TWD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        eligibleDuration: {
          '@type': 'QuantitativeValue',
          value: '14',
          unitText: 'DAY'
        },
        description: locale === 'zh-tw'
          ? '14 天免費試用，無需信用卡'
          : '14-day free trial, no credit card required'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
        bestRating: '5',
        worstRating: '1'
      },
      review: [
        {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5'
          },
          author: {
            '@type': 'Person',
            name: locale === 'zh-tw' ? '陳小姐' : 'Ms. Chen'
          },
          reviewBody: locale === 'zh-tw'
            ? '設定超級簡單，客人用 LINE 就能直接預約，減少很多電話溝通時間！'
            : 'Super easy setup, customers can book directly via LINE, saving so much phone time!',
          datePublished: '2024-11-01'
        }
      ],
      featureList: locale === 'zh-tw' ? [
        '原生 LINE 整合 - 客戶直接在 LINE 上預訂',
        '5 分鐘設定 - 不需任何技術知識',
        'QR 代碼預訂 - 掃描預訂，非接觸式且安全',
        '自動提醒 - 將不出席率降低 40%',
        '即時分析 - 了解您的業務績效',
        '多語支援 - 繁體中文、英文',
        '員工管理 - 管理多個員工排班表',
        '自訂預約表單 - 收集客戶資訊',
        '24/7 可用性 - 絕不錯過任何預訂機會',
        '行動最佳化 - 在手機和平板電腦上完美顯示'
      ] : [
        'Native LINE Integration - Customers book directly on LINE',
        '5-Minute Setup - No technical knowledge required',
        'QR Code Booking - Scan and book, contactless and safe',
        'Automated Reminders - Reduce no-shows by 40%',
        'Real-time Analytics - Understand your business performance',
        'Multi-language Support - Traditional Chinese, English',
        'Staff Management - Manage multiple staff schedules',
        'Custom Booking Forms - Collect customer information',
        '24/7 Availability - Never miss a booking opportunity',
        'Mobile Optimized - Perfect display on phones and tablets'
      ],
      screenshot: [
        `${baseUrl}/brochure/booking-modal.png`,
        `${baseUrl}/brochure/calendar-view.png`,
        `${baseUrl}/brochure/mobile-form.png`
      ],
      audience: {
        '@type': 'BusinessAudience',
        audienceType: locale === 'zh-tw' ? '中小型企業' : 'Small and Medium Businesses',
        geographicArea: {
          '@type': 'Country',
          name: locale === 'zh-tw' ? '台灣' : 'Taiwan'
        }
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'Taiwan',
          alternateName: 'TW'
        },
        {
          '@type': 'Country',
          name: 'Japan',
          alternateName: 'JP'
        },
        {
          '@type': 'Country',
          name: 'Thailand',
          alternateName: 'TH'
        }
      ],
      availableLanguage: ['zh-TW', 'en', 'ja', 'th'],
      brand: {
        '@type': 'Brand',
        name: 'Weebo',
        logo: `${baseUrl}/logo.png`
      },
      provider: {
        '@type': 'Organization',
        name: 'Weebo',
        url: baseUrl
      },
      softwareHelp: {
        '@type': 'CreativeWork',
        url: `${baseUrl}/${locale}/contact`
      }
    };

    return (
      <>
        {/* Enhanced Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <BrochureWrapper />
      </>
    );
  }

  // User is authenticated - fetch businesses server-side
  let businesses;
  try {
    businesses = await prisma.business.findMany({
      where: {
        ownerId: session.id,
        isActive: true,
      },
      select: {
        id: true,
        businessName: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    // On database error, show brochure
    return <BrochureWrapper />;
  }

  // Redirect based on business count
  if (businesses.length === 0) {
    // No businesses - go to setup to create first one
    redirect('/setup');
  } else if (businesses.length === 1) {
    // One business - go directly to dashboard
    redirect(`/dashboard/${businesses[0].id}`);
  } else {
    // Multiple businesses - need to check localStorage for last selected
    // This requires client-side component since localStorage is browser-only
    return <AuthenticatedRedirect businesses={businesses} userId={session.id} />;
  }
}
