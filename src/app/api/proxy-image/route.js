/**
 * Image Proxy API Route
 * Proxies images from external sources to avoid CORS issues
 * Includes SSRF protection via domain whitelist
 */

import { NextResponse } from 'next/server';
import { proxyRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';

// Whitelist of allowed domains for image proxying
const ALLOWED_DOMAINS = [
  'profile.line-susercontent.net',
  'cdn.line-susercontent.net',
  'obs.line-susercontent.net',
  'scdn.line-apps.com',
  process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null,
].filter(Boolean);

// Private IP ranges to block (SSRF prevention)
const PRIVATE_IP_PATTERNS = [
  /^127\./,                    // 127.0.0.0/8
  /^10\./,                     // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,               // 192.168.0.0/16
  /^169\.254\./,               // 169.254.0.0/16 (link-local)
  /^::1$/,                     // IPv6 localhost
  /^fc00:/,                    // IPv6 private
  /^fe80:/,                    // IPv6 link-local
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 5000; // 5 seconds

/**
 * Validate if URL is safe to fetch
 * @param {string} urlString - URL to validate
 * @returns {{valid: boolean, reason?: string, url?: URL}}
 */
function validateImageUrl(urlString) {
  let url;

  try {
    url = new URL(urlString);
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // Only allow HTTPS
  if (url.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTPS URLs are allowed' };
  }

  // Check if domain is in whitelist
  const isAllowed = ALLOWED_DOMAINS.some(domain => {
    return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
  });

  if (!isAllowed) {
    return { valid: false, reason: 'Domain not in whitelist' };
  }

  // Check for private IP addresses in hostname
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(url.hostname)) {
      return { valid: false, reason: 'Private IP addresses are not allowed' };
    }
  }

  return { valid: true, url };
}

export async function GET(request) {
  try {
    // Apply rate limiting
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(proxyRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL for SSRF protection
    const validation = validateImageUrl(imageUrl);
    if (!validation.valid) {
      console.warn('[ProxyImage] Blocked request:', validation.reason, imageUrl);
      return NextResponse.json(
        { error: 'Invalid image URL', reason: validation.reason },
        { status: 403 }
      );
    }

    // Fetch the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const imageResponse = await fetch(validation.url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Kitsune-Image-Proxy/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch image' },
          { status: imageResponse.status }
        );
      }

      // Validate content type
      const contentType = imageResponse.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.warn('[ProxyImage] Invalid content type:', contentType);
        return NextResponse.json(
          { error: 'URL does not point to an image' },
          { status: 400 }
        );
      }

      // Check content length
      const contentLength = imageResponse.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: 'Image too large (max 5MB)' },
          { status: 413 }
        );
      }

      // Get the image data
      const imageBuffer = await imageResponse.arrayBuffer();

      // Double-check size after download
      if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: 'Image too large (max 5MB)' },
          { status: 413 }
        );
      }

      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      });
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Image fetch timeout' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
