/**
 * Dynamic Sitemap Generator for Weebo
 * Generates multilingual sitemap with hreflang support
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

export default function sitemap() {
  // Dynamic base URL that works in all environments
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://weebo-ten.vercel.app');

  const locales = ['en', 'zh-tw'];
  const currentDate = new Date();

  // Helper function to create multilingual alternates
  const createAlternates = (path) => {
    const alternates = { languages: {} };
    locales.forEach((locale) => {
      alternates.languages[locale] = `${baseUrl}/${locale}${path}`;
    });
    return alternates;
  };

  // Public pages that should be indexed
  const publicPages = [
    {
      path: '', // Root page shows brochure for non-authenticated users
      priority: 1.0,
      changeFrequency: 'monthly',
    },
    {
      path: '/contact',
      priority: 0.7,
      changeFrequency: 'monthly',
    },
    {
      path: '/legal/privacy',
      priority: 0.5,
      changeFrequency: 'yearly',
    },
    {
      path: '/legal/terms',
      priority: 0.5,
      changeFrequency: 'yearly',
    },
  ];

  // Generate sitemap entries for each locale
  const sitemapEntries = [];

  publicPages.forEach((page) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: createAlternates(page.path),
      });
    });
  });

  return sitemapEntries;
}
