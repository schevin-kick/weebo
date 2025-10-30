export const metadata = {
  title: 'Kitsune Booking - Smart Appointment Scheduling for Asia | LINE Integration',
  description: 'Transform your business with Kitsune Booking - the intelligent appointment scheduling platform built for Asia. Seamless LINE integration, 5-minute setup, powerful analytics, and 24/7 booking for salons, spas, cafes, and service businesses.',
  keywords: 'appointment booking, LINE booking system, Asia booking platform, appointment scheduler, salon booking, spa booking, cafe reservations, QR code booking, LINE integration, business scheduling, Japan booking system, Thailand booking, Taiwan booking',
  openGraph: {
    title: 'Kitsune Booking - Smart Appointment Scheduling with LINE Integration',
    description: 'The intelligent booking platform built for Asia. Powered by LINE, designed for simplicity, packed with analytics. Setup in 5 minutes.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Kitsune Booking',
    images: [
      {
        url: '/brochure/kitsune2.webp',
        width: 1200,
        height: 630,
        alt: 'Kitsune Booking Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitsune Booking - Smart Appointment Scheduling for Asia',
    description: 'Transform your business with LINE-powered booking. 5-minute setup, powerful analytics, 24/7 availability.',
    images: ['/brochure/kitsune2.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kitsunebooking.com',
  },
};

export default function BrochureLayout({ children }) {
  return children;
}
