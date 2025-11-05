import createNextIntlPlugin from 'next-intl/plugin';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,

  // Allow ngrok and localhost origins in development
  allowedDevOrigins: [
    'cozies-unentreated-aleen.ngrok-free.dev',
    'localhost:3000',
  ],

  // Webpack configuration to include Prisma binaries
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        // LIFF-compatible headers for booking routes
        source: '/book/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // HSTS - only in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
          // Content Security Policy - LIFF-compatible
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.line-scdn.net https://www.googletagmanager.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.line.me https://access.line.me https://*.r2.dev https://*.cloudflarestorage.com https://photon.komoot.io https://api.stripe.com https://checkout.stripe.com wss:",
              "frame-src 'self' https://liff.line.me",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors https://liff.line.me",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        // Strict security headers for all other routes (dashboard, admin, etc)
        source: '/((?!book).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // HSTS - only in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.line-scdn.net https://www.googletagmanager.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.line.me https://access.line.me https://*.r2.dev https://*.cloudflarestorage.com https://photon.komoot.io https://api.stripe.com https://checkout.stripe.com wss:",
              "frame-src 'self' https://liff.line.me",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Ensure Prisma binaries are included in serverless functions
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/.prisma/client/**/*', './node_modules/@prisma/client/**/*'],
    },
    // Body size limits for security
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
