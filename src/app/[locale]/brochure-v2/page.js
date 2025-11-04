import BrochureV2Content from '@/components/brochure-v2/BrochureV2Content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: t('metadata.keywords'),
    openGraph: {
      title: t('metadata.ogTitle'),
      description: t('metadata.ogDescription'),
      type: 'website',
      locale: locale,
      siteName: 'Kitsune',
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
      title: t('metadata.ogTitle'),
      description: t('metadata.ogDescription'),
      images: ['/brochure/og-image.png'],
    },
    alternates: {
      canonical: `/${locale}/brochure-v2`,
      languages: {
        'en': '/en/brochure-v2',
        'zh-tw': '/zh-tw/brochure-v2',
      },
    },
  };
}

export default async function BrochureV2Page({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Kitsune',
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: '200',
              priceCurrency: 'TWD',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                referenceQuantity: {
                  '@type': 'QuantitativeValue',
                  value: '1',
                  unitText: 'MONTH'
                }
              }
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '127'
            },
            operatingSystem: 'Web, LINE',
            description: 'Professional appointment booking system that runs natively on LINE messenger',
          }),
        }}
      />

      <BrochureV2Content />
    </>
  );
}
