# Security Documentation

This document outlines the security measures implemented in the Kitsune booking application.

## Table of Contents

1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Setup Instructions](#setup-instructions)
4. [Rate Limiting](#rate-limiting)
5. [CSRF Protection](#csrf-protection)
6. [Input Validation](#input-validation)
7. [SSRF Prevention](#ssrf-prevention)
8. [Security Headers](#security-headers)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The application implements multiple layers of security to protect against common web vulnerabilities and attacks:

- **Rate Limiting** - Prevents API abuse and DDoS attacks
- **CSRF Protection** - Prevents cross-site request forgery
- **SSRF Prevention** - Blocks server-side request forgery attacks
- **Input Sanitization** - Removes malicious code from user input
- **Security Headers** - Browser-level protections against XSS, clickjacking, etc.
- **Authentication** - JWT-based session management with httpOnly cookies
- **Authorization** - Business ownership verification on all operations

---

## Security Features

### 1. Rate Limiting

**Purpose**: Prevent API abuse, brute force attacks, and DDoS attempts.

**Implementation**:
- Uses Upstash Redis for distributed rate limiting
- Different limits for different endpoint types:
  - Public endpoints: 10 requests/minute per IP
  - Auth endpoints: 5 requests/minute per IP
  - Authenticated users: 60 requests/minute per user
  - Upload endpoints: 5 requests/minute per user
  - Availability checks: 30 requests/minute per IP
  - Image proxy: 20 requests/minute per IP

**Location**: `/src/lib/ratelimit.js`

**Graceful Degradation**: If Redis is not configured, rate limiting is disabled (logs warning).

---

### 2. CSRF Protection

**Purpose**: Prevent attackers from making unauthorized requests on behalf of authenticated users.

**Implementation**:
- Double-submit cookie pattern
- CSRF token generated on login/session creation
- Token validated on all POST, PUT, PATCH, DELETE requests
- Token stored in httpOnly cookie (hashed)
- Client sends token in `X-CSRF-Token` header

**Location**: `/src/lib/csrf.js`

**Protected Endpoints**:
- POST `/api/businesses` - Create business
- PUT/DELETE `/api/businesses/[id]` - Update/delete business
- POST `/api/upload` - File upload
- PATCH `/api/bookings/[id]/status` - Update booking status
- POST `/api/closed-dates` - Create closed date
- All other state-changing operations

---

### 3. Input Validation & Sanitization

**Purpose**: Prevent XSS, SQL injection, and other injection attacks.

**Implementation**:
- **Server-side validation** using Zod schemas
- **HTML sanitization** using DOMPurify (isomorphic-dompurify)
- **Type-specific validation**:
  - Email: Lowercase, valid format
  - Phone: Numbers and valid punctuation only
  - Number: Digits, decimal, minus sign only
  - Text: HTML stripped, length limited to 1000 chars

**Location**: `/src/lib/validationSchemas.js`

**Usage**:
```javascript
import { sanitizeUserInput } from '@/lib/validationSchemas';

const cleanName = sanitizeUserInput(userInput, 'text');
const cleanEmail = sanitizeUserInput(userEmail, 'email');
```

---

### 4. SSRF Prevention

**Purpose**: Prevent attackers from using the proxy endpoint to scan internal networks or access restricted resources.

**Implementation**:
- **Domain whitelist** for image proxying:
  - `profile.line-susercontent.net`
  - `cdn.line-susercontent.net`
  - `obs.line-susercontent.net`
  - `scdn.line-apps.com`
  - Your Cloudflare R2 bucket domain
- **Protocol restriction**: Only HTTPS allowed
- **Private IP blocking**: Blocks 127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, 169.254.0.0/16
- **File size limit**: 5MB maximum
- **Content-type validation**: Only image/* allowed
- **Timeout**: 5 seconds

**Location**: `/src/app/api/proxy-image/route.js`

---

### 5. Security Headers

**Purpose**: Provide browser-level protections against XSS, clickjacking, MIME-sniffing, and other attacks.

**Implemented Headers**:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking by blocking iframe embedding |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-sniffing attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disable unused browser features |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS (production only) |
| `Content-Security-Policy` | See below | Prevent XSS and control resource loading |

**Content Security Policy**:
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.line-susercontent.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https: http:;
connect-src 'self' https://api.line.me https://access.line.me https://*.r2.dev;
frame-src 'self' https://liff.line.me;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

**Location**: `/src/next.config.mjs`

---

### 6. Request Logging & Monitoring

**Purpose**: Track API usage and detect suspicious activity.

**Implementation**:
- Middleware logs all API requests
- Includes: timestamp, method, path, IP address, request ID
- Blocks suspicious user agents (sqlmap, nikto, etc.)
- Validates Content-Type headers

**Location**: `/src/middleware.js`

---

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install @upstash/ratelimit @upstash/redis isomorphic-dompurify
```

### 2. Configure Rate Limiting (Optional but Recommended)

1. Sign up for a free account at [Upstash](https://upstash.com)
2. Create a Redis database
3. Copy the REST URL and token
4. Add to your `.env` file:

```env
UPSTASH_REDIS_REST_URL="https://your-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

**Note**: If not configured, rate limiting will be disabled and a warning will be logged.

### 3. Set Authentication Secret

Ensure you have a strong random secret for JWT signing:

```env
AUTH_SECRET="your-strong-random-32-character-secret"
```

Generate one with:
```bash
openssl rand -hex 32
```

### 4. (Optional) Disable CSRF in Development

Only for local development/testing:

```env
DISABLE_CSRF="true"  # Only in development!
```

**WARNING**: Never disable CSRF protection in production!

---

## Rate Limiting

### How It Works

1. Each request is identified by IP address (unauthenticated) or user ID (authenticated)
2. Rate limiter checks request count in sliding time window
3. If limit exceeded, returns `429 Too Many Requests`
4. Response includes headers:
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Requests remaining
   - `X-RateLimit-Reset`: Timestamp when limit resets
   - `Retry-After`: Seconds to wait before retrying

### Rate Limits by Endpoint

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public booking | 10 req | 1 minute |
| Auth login | 5 req | 1 minute |
| Authenticated API | 60 req | 1 minute |
| File upload | 5 req | 1 minute |
| Availability check | 30 req | 1 minute |
| Image proxy | 20 req | 1 minute |

### Testing Rate Limits

```bash
# Test with curl (repeat quickly to hit limit)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"businessId":"test"}'
done
```

---

## CSRF Protection

### How It Works

1. **Login**: Server generates CSRF token and stores hashed version in cookie
2. **Client**: Receives token (e.g., in response body or separate endpoint)
3. **Requests**: Client includes token in `X-CSRF-Token` header
4. **Validation**: Server hashes header token and compares with cookie
5. **Success**: Request proceeds if tokens match
6. **Failure**: Returns `403 Forbidden` if tokens don't match

### Client Implementation Example

```javascript
// After login, get CSRF token
const response = await fetch('/api/auth/session');
const { csrfToken } = await response.json();

// Store token (e.g., in state or context)
const [csrfToken, setCsrfToken] = useState(null);

// Include in all state-changing requests
await fetch('/api/businesses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### Protected HTTP Methods

- POST
- PUT
- PATCH
- DELETE

### Exempted Methods

- GET (read-only)
- HEAD
- OPTIONS

---

## Input Validation

### Validation Layers

1. **Client-side** (UI): Real-time feedback, better UX
2. **Zod Schemas** (API): Type-safe runtime validation
3. **DOMPurify** (Sanitization): Remove malicious HTML/scripts
4. **Database** (Prisma): Parameterized queries prevent SQL injection

### Example Usage

```javascript
import { z } from 'zod';
import { sanitizeUserInput, businessNameSchema } from '@/lib/validationSchemas';

// Validate with Zod
const schema = z.object({
  businessName: businessNameSchema,
  phone: z.string().optional(),
});

const data = schema.parse(req.body);

// Sanitize user input
const cleanBusinessName = sanitizeUserInput(data.businessName, 'text');
const cleanPhone = sanitizeUserInput(data.phone, 'phone');
```

---

## SSRF Prevention

### Whitelist Configuration

To add additional allowed domains for image proxying:

```javascript
// src/app/api/proxy-image/route.js
const ALLOWED_DOMAINS = [
  'profile.line-susercontent.net',
  'cdn.line-susercontent.net',
  'your-additional-domain.com', // Add here
  process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null,
].filter(Boolean);
```

### Security Checks

The proxy validates:
- ✅ Domain is in whitelist
- ✅ Protocol is HTTPS
- ✅ Not a private IP address
- ✅ Content-Type is image/*
- ✅ File size < 5MB
- ✅ Request completes within 5 seconds

---

## Security Headers

### Testing Headers

Check your security headers:

```bash
curl -I https://your-app.vercel.app
```

Or use online tools:
- [Security Headers](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)

### Adjusting CSP

If you need to add additional domains to Content Security Policy:

```javascript
// next.config.mjs
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://your-cdn.com", // Add domain
    // ... rest of policy
  ].join('; '),
}
```

---

## Best Practices

### For Developers

1. **Never disable security features in production**
2. **Always validate and sanitize user input**
3. **Use HTTPS in production** (enforced by HSTS header)
4. **Keep dependencies updated**: `npm audit` regularly
5. **Review security logs** for suspicious activity
6. **Use environment variables** for secrets
7. **Enable rate limiting** with Upstash Redis
8. **Test CSRF protection** on all state-changing endpoints

### For Deployment

1. **Set strong `AUTH_SECRET`** (32+ random characters)
2. **Configure Upstash Redis** for rate limiting
3. **Enable HSTS** (automatic in production)
4. **Monitor logs** for security events
5. **Use Vercel's IP blocking** for repeat offenders
6. **Set up error tracking** (Sentry, etc.)

---

## Troubleshooting

### Rate Limiting Not Working

**Symptom**: No rate limit errors even when exceeding limits

**Solutions**:
1. Check Redis connection: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set?
2. Check logs for: `[RateLimit] Rate limiting disabled - UPSTASH env vars not set`
3. Verify Redis database is active in Upstash dashboard

### CSRF Token Errors

**Symptom**: `403 Forbidden` with "Invalid CSRF token"

**Solutions**:
1. Verify `X-CSRF-Token` header is included in request
2. Check cookie is being sent (check browser dev tools)
3. Ensure token hasn't expired (24 hour lifetime)
4. For development only: Set `DISABLE_CSRF="true"` in `.env`

### Image Proxy 403 Errors

**Symptom**: Images fail to load through proxy

**Solutions**:
1. Check domain is in whitelist: `/src/app/api/proxy-image/route.js`
2. Verify URL uses HTTPS (not HTTP)
3. Check image size < 5MB
4. Review logs for specific error

### Content-Type Errors

**Symptom**: `415 Unsupported Media Type`

**Solutions**:
1. Set proper `Content-Type` header:
   - JSON: `application/json`
   - Form: `multipart/form-data`
2. Check middleware configuration in `/src/middleware.js`

---

## Security Checklist

Before deploying to production:

- [ ] Set strong `AUTH_SECRET` (32+ random characters)
- [ ] Configure Upstash Redis for rate limiting
- [ ] Verify CSRF protection is enabled (`DISABLE_CSRF` not set)
- [ ] Test rate limits on public endpoints
- [ ] Review CSP policy for your specific domains
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring and alerts
- [ ] Test CSRF token flow end-to-end
- [ ] Verify image proxy whitelist
- [ ] Run `npm audit` and fix vulnerabilities

---

## Reporting Security Issues

If you discover a security vulnerability, please email security@your-domain.com (DO NOT create a public GitHub issue).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Upstash Rate Limiting Docs](https://upstash.com/docs/redis/features/ratelimiting)
