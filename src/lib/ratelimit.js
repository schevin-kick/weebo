import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if env vars are set)
// Supports both Vercel KV and direct Upstash Redis
let redis;
let rateLimitEnabled = false;

// Check for Vercel KV env vars first (preferred for Vercel deployments)
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  rateLimitEnabled = true;
  const source = process.env.KV_REST_API_URL ? 'Vercel KV' : 'Upstash Redis';
  console.log(`[RateLimit] Rate limiting enabled with ${source}`);
} else {
  console.warn('[RateLimit] Rate limiting disabled - Redis env vars not set');
  console.warn('[RateLimit] For Vercel: Set up Vercel KV in Storage tab');
  console.warn('[RateLimit] For other hosts: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
}

/**
 * Rate limiting tiers
 */

// Public endpoints - strict limits
export const publicRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : null;

// Auth endpoints - very strict
export const authRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

// Authenticated users - more permissive
export const authenticatedRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
      analytics: true,
      prefix: 'ratelimit:authenticated',
    })
  : null;

// Upload endpoints - moderate limits
export const uploadRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 uploads per minute
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  : null;

// Availability check - more permissive for better UX
export const availabilityRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
      analytics: true,
      prefix: 'ratelimit:availability',
    })
  : null;

// Proxy image - moderate limits
export const proxyRateLimit = rateLimitEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
      analytics: true,
      prefix: 'ratelimit:proxy',
    })
  : null;

/**
 * Get client identifier (IP address or user ID)
 * @param {Request} request - Next.js request object
 * @param {object|null} session - User session (if authenticated)
 * @returns {string} Identifier for rate limiting
 */
export function getIdentifier(request, session = null) {
  // Use user ID if authenticated
  if (session?.id) {
    return `user:${session.id}`;
  }

  // Otherwise use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 * @param {Ratelimit|null} rateLimiter - Rate limiter instance
 * @param {string} identifier - Client identifier
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function checkRateLimit(rateLimiter, identifier) {
  // If rate limiting is disabled, allow all requests
  if (!rateLimitEnabled || !rateLimiter) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: 0,
    };
  }

  try {
    const startTime = Date.now();
    const result = await rateLimiter.limit(identifier);
    const duration = Date.now() - startTime;

    // Log rate limit checks (useful for debugging)
    if (!result.success) {
      console.warn(`[RateLimit] ❌ BLOCKED ${identifier} - Limit: ${result.limit}, Remaining: ${result.remaining}, Reset: ${new Date(result.reset).toLocaleTimeString()}`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[RateLimit] ✅ Allowed ${identifier} - Remaining: ${result.remaining}/${result.limit} (${duration}ms)`);
    }

    return result;
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

/**
 * Create rate limit response
 * @param {object} rateLimitResult - Result from checkRateLimit
 * @returns {Response} Next.js response with rate limit headers
 */
export function createRateLimitResponse(rateLimitResult) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Middleware wrapper for rate limiting
 * @param {Ratelimit|null} rateLimiter - Rate limiter to use
 * @param {function} handler - Route handler function
 * @returns {function} Wrapped handler with rate limiting
 */
export function withRateLimit(rateLimiter, handler) {
  return async (request, ...args) => {
    const identifier = getIdentifier(request);
    const result = await checkRateLimit(rateLimiter, identifier);

    if (!result.success) {
      return createRateLimitResponse(result);
    }

    // Add rate limit headers to response
    const response = await handler(request, ...args);

    // Clone response to add headers
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export default {
  publicRateLimit,
  authRateLimit,
  authenticatedRateLimit,
  uploadRateLimit,
  availabilityRateLimit,
  proxyRateLimit,
  getIdentifier,
  checkRateLimit,
  createRateLimitResponse,
  withRateLimit,
  enabled: rateLimitEnabled,
};
