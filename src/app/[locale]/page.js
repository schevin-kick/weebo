/**
 * Home Page
 * Shows brochure to all users - fully static and independent of authentication
 */

import BrochureWrapper from '@/components/home/BrochureWrapper';
import { getTranslations } from 'next-intl/server';
import { getSubscriptionConfig } from '@/lib/subscriptionConfig';

// Metadata is now defined in the layout for better SEO and to ensure
// it appears in the initial HTML (not streamed)

export default async function Home({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  // Fetch pricing configuration server-side
  const pricingConfig = await getSubscriptionConfig();

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
      price: String(pricingConfig.priceAmount),
      priceCurrency: pricingConfig.priceCurrency,
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Weebo'
      },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(pricingConfig.priceAmount),
        priceCurrency: pricingConfig.priceCurrency,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitText: 'MONTH'
        }
      },
      description: locale === 'zh-tw'
        ? `月費方案，包含所有功能，${pricingConfig.trialDays} 天免費試用`
        : `Monthly plan with all features, ${pricingConfig.trialDays}-day free trial`
    },
    additionalOffers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: pricingConfig.priceCurrency,
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      eligibleDuration: {
        '@type': 'QuantitativeValue',
        value: String(pricingConfig.trialDays),
        unitText: 'DAY'
      },
      description: locale === 'zh-tw'
        ? `${pricingConfig.trialDays} 天免費試用，無需信用卡`
        : `${pricingConfig.trialDays}-day free trial, no credit card required`
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
      <BrochureWrapper pricingConfig={pricingConfig} />
    </>
  );
}
