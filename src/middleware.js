import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next.js Middleware for locale detection and global security checks
 * Runs on every request before reaching the API routes
 */

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Skip locale detection for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|otf|eot|mp4|webm|mov|avi)$/)
  ) {
    const response = NextResponse.next();
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);

    // Log API requests
    if (pathname.startsWith('/api/')) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${request.method} ${pathname} - IP: ${ip} - Request ID: ${requestId}`);
    }

    // Security checks continue for API routes
    return applySecurityChecks(request, response, ip);
  }

  // Handle locale detection and routing
  const locales = routing.locales;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // If no locale in path, detect and redirect
  if (!pathnameHasLocale) {
    let locale = routing.defaultLocale;

    // Priority 1: Check for saved locale preference in cookie
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
      locale = cookieLocale;
    }
    // Priority 2: Check Vercel Geo IP for Taiwan
    else if (request.geo?.country === 'TW') {
      locale = 'zh-tw';
    }
    // Priority 3: Check Accept-Language header
    else {
      const acceptLanguage = request.headers.get('accept-language') || '';
      if (acceptLanguage.includes('zh-TW') || acceptLanguage.includes('zh-Hant') || acceptLanguage.includes('zh-HK')) {
        locale = 'zh-tw';
      }
    }

    // Redirect to localized path
    const newUrl = new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url);
    const response = NextResponse.redirect(newUrl);

    // Set cookie to remember preference (1 year)
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;
  }

  // Use next-intl middleware for locale handling
  const response = intlMiddleware(request);

  // Add request ID for logging/tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // Apply security checks
  return applySecurityChecks(request, response, ip);
}

/**
 * Apply security checks to the response
 */
function applySecurityChecks(request, response, ip) {
  // Block suspicious user agents (basic bot protection)
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'metasploit',
    'burpsuite',
    'acunetix',
    'appscan',
    'nessus',
    'qualys',
    'openvas',
  ];

  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    console.warn(`[Security] Blocked suspicious user agent: ${userAgent} - IP: ${ip}`);
    return new NextResponse(
      JSON.stringify({ error: 'Access denied' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Validate Content-Type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type') || '';

    // Allow these content types
    const validContentTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
    ];

    const isValid = validContentTypes.some(type => contentType.includes(type));

    if (request.nextUrl.pathname.startsWith('/api/') && !isValid && !contentType.includes('multipart/')) {
      console.warn(`[Security] Invalid Content-Type: ${contentType} for ${request.method} ${request.nextUrl.pathname}`);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid Content-Type' }),
        {
          status: 415,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return response;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
