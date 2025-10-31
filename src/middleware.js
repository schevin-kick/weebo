import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for global security checks
 * Runs on every request before reaching the API routes
 */

export function middleware(request) {
  const response = NextResponse.next();

  // Add request ID for logging/tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // Log API requests (excluding static files)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    console.log(`[${timestamp}] ${method} ${path} - IP: ${ip} - Request ID: ${requestId}`);
  }

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
