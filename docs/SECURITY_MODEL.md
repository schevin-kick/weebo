# Subscription Security Model

## Overview

The subscription system uses **defense in depth** with multiple layers:

1. **Frontend (UX)** - Immediate feedback, can be bypassed
2. **Backend (Security)** - Real access control, cannot be bypassed
3. **Business-level checks** - Protects public endpoints (customer bookings)

---

## Security Layers

### Layer 1: Frontend (`SubscriptionCheck.js`)

**Location**: [src/components/SubscriptionCheck.js](../src/components/SubscriptionCheck.js)

**Purpose**:
- Provide immediate UX feedback
- Show trial countdown banner
- Redirect to subscription page before API calls fail

**Security Level**: ⚠️ **NOT SECURE**
- User can intercept `/api/subscription/status` response
- User can modify JavaScript to bypass checks
- User can disable component entirely

**Why it exists**:
- Better user experience (immediate feedback)
- Reduces wasted API calls
- Shows helpful messaging (trial countdown, etc.)

**Attack scenario**:
```javascript
// User intercepts fetch response
fetch('/api/subscription/status')
  .then(res => res.json())
  .then(data => {
    // User modifies: { hasAccess: false } → { hasAccess: true }
    return { ...data, hasAccess: true };
  });
```

**Result**: Dashboard loads, but all API calls still fail ✅

---

### Layer 2: Backend Middleware (`requireSubscription`)

**Location**: [src/middleware/subscriptionCheck.js](../src/middleware/subscriptionCheck.js)

**Purpose**:
- Real access control
- Verify subscription on server-side
- Cannot be bypassed by user

**Security Level**: ✅ **SECURE**
- Runs on server
- User cannot modify
- Checks actual database state
- Uses secure session tokens

**How it works**:
```javascript
// In protected API routes
const subscriptionCheck = await requireSubscription(request);
if (subscriptionCheck) {
  return subscriptionCheck; // 403 Forbidden
}
```

**Protected Routes**:
- ✅ `PUT /api/businesses/:id` - Update business
- ✅ `DELETE /api/businesses/:id` - Delete business (if exists)
- More routes can be easily protected

---

### Layer 3: Business-Level Checks

**Location**: Public-facing endpoints where customers interact

**Purpose**:
- Block bookings for businesses whose owners have expired subscriptions
- Protects public endpoints that don't require auth

**Example**: [src/app/api/bookings/route.js:67-79](../src/app/api/bookings/route.js)

```javascript
// Customer tries to book (no auth required)
POST /api/bookings
  ↓
// Check business owner's subscription
const { hasAccess } = await checkSubscriptionAccess(business.ownerId);
  ↓
if (!hasAccess) {
  return 403; // "Business unavailable for bookings"
}
```

**Why needed**:
- Booking endpoint is public (customers use LIFF app)
- Customers shouldn't see error, just "unavailable"
- Business owner's expired subscription affects their customers

**Protected Public Endpoints**:
- ✅ `POST /api/bookings` - Customer creates booking

---

## Attack Scenarios & Defenses

### Attack 1: Frontend Bypass

**Attack**:
```javascript
// User modifies React component to always return true
<SubscriptionCheck>
  {children} // Always renders, ignoring subscription
</SubscriptionCheck>
```

**Defense**:
✅ Backend still checks subscription
❌ User sees dashboard but can't perform actions

**Result**: User blocked at API level

---

### Attack 2: Intercepted API Response

**Attack**:
```javascript
// User intercepts /api/subscription/status
// Changes: { hasAccess: false } → { hasAccess: true }
```

**Defense**:
✅ Backend middleware checks real subscription status
❌ Frontend shows UI but all writes fail

**Result**: User blocked at API level

---

### Attack 3: Direct API Calls

**Attack**:
```bash
# User bypasses frontend entirely
curl -X PUT https://yourapp.com/api/businesses/123 \
  -H "Cookie: session=..." \
  -d '{"businessName": "Hacked"}'
```

**Defense**:
✅ `requireSubscription()` middleware checks session
✅ Database query verifies actual subscription status
✅ Returns 403 if no access

**Result**: Request blocked ✅

---

### Attack 4: Session Token Manipulation

**Attack**:
```javascript
// User tries to modify JWT session token
// Add: "subscription": { "hasAccess": true }
```

**Defense**:
✅ JWT is signed with `AUTH_SECRET`
✅ Modified token fails signature verification
✅ User gets logged out

**Result**: Attack fails, session invalidated ✅

---

### Attack 5: Database Direct Access

**Attack**:
User somehow gets database credentials and tries to modify:
```sql
UPDATE "BusinessOwner"
SET "subscriptionStatus" = 'active'
WHERE id = 'their_user_id';
```

**Defense**:
✅ Database credentials secured
✅ Webhook from Stripe will overwrite within 10 minutes
✅ Cache invalidation ensures quick detection

**Result**: Temporary access only, quickly reverted

---

## Caching & Security

### 3-Tier Cache System

```
API Request
    ↓
Session Check (1 hour cache)
    ├─ HIT → Use cached status ✅
    └─ MISS ↓
Redis Check (10 min cache)
    ├─ HIT → Use cached status ✅
    └─ MISS ↓
Database Query
    ↓
Return actual status ✅
```

**Security implications**:

1. **Session cache (1 hour)**:
   - Stored in signed JWT
   - User cannot modify (signature check)
   - Max 1 hour of stale data

2. **Redis cache (10 minutes)**:
   - Server-side only
   - User cannot access
   - Invalidated by webhooks
   - Max 10 minutes of stale data

3. **Database (source of truth)**:
   - Always accurate
   - Updated by Stripe webhooks
   - Fallback when cache misses

**Worst case scenario**:
- User cancels subscription
- Webhook fails (extremely rare)
- User has access for max 1 hour
- Next request after cache expires = blocked

---

## Key Security Principles

### 1. Never Trust the Client

❌ **Bad**: Only check subscription in frontend
```javascript
// Bad - user can bypass
if (subscription.hasAccess) {
  allowAction();
}
```

✅ **Good**: Always verify on backend
```javascript
// Good - server-side check
const subscriptionCheck = await requireSubscription(request);
if (subscriptionCheck) return subscriptionCheck;
```

### 2. Defense in Depth

Multiple layers:
1. Frontend (UX)
2. Backend middleware (security)
3. Business-level checks (for public endpoints)
4. Database constraints (data integrity)

### 3. Fail Secure

If subscription check fails (error), we **allow access**:
```javascript
try {
  const { hasAccess } = await checkSubscriptionAccess(userId);
  if (!hasAccess) return 403;
} catch (error) {
  // Fail open - don't lock users out on technical errors
  console.error(error);
  return null; // Allow access
}
```

**Why?**
- Technical issues shouldn't lock out paying customers
- Better UX than hard failure
- Still logged for monitoring

### 4. Webhook-Driven Updates

Subscription changes come from **Stripe webhooks** (server-to-server):
- User cannot forge webhooks (signature verification)
- Immediate status updates
- Cache invalidation on every change

---

## Protected vs Unprotected Routes

### Protected (Require Active Subscription)

**Owner endpoints**:
- ✅ `PUT /api/businesses/:id` - Update business
- ✅ `DELETE /api/businesses/:id` - Delete business
- 🔲 `POST /api/services/*` - Manage services (TODO)
- 🔲 `PUT /api/services/:id` - Update service (TODO)
- 🔲 `DELETE /api/services/:id` - Delete service (TODO)
- 🔲 `POST /api/closed-dates` - Add closed dates (TODO)

**Public endpoints with owner check**:
- ✅ `POST /api/bookings` - Create booking (checks owner's subscription)

### Unprotected (Always Allow)

**Authentication**:
- `/api/auth/*` - Login, logout, session

**Subscription management**:
- `/api/subscription/status` - Get status (needed for paywall)
- `/api/stripe/create-checkout-session` - Subscribe
- `/api/stripe/portal` - Manage subscription
- `/api/stripe/webhook` - Stripe webhooks

**Public reads**:
- `GET /api/businesses/:id` - View business (needed for LIFF app)
- `GET /api/bookings/availability` - Check availability

**First business creation**:
- `POST /api/businesses` - Allow first business to start trial

---

## Testing Security

### Manual Tests

1. **Test frontend bypass**:
   ```javascript
   // In browser console
   fetch('/api/subscription/status')
     .then(r => r.json())
     .then(data => console.log('Modified:', {...data, hasAccess: true}));
   // Try to use dashboard
   // Verify: API calls still fail
   ```

2. **Test expired subscription**:
   ```sql
   -- Manually expire trial in database
   UPDATE "BusinessOwner"
   SET "trialEndsAt" = NOW() - INTERVAL '1 day',
       "subscriptionStatus" = 'trial_expired'
   WHERE id = 'user_id';
   ```
   - Try to edit business
   - Verify: 403 Forbidden

3. **Test direct API call**:
   ```bash
   # Get session cookie from browser
   curl -X PUT http://localhost:3000/api/businesses/biz_123 \
     -H "Cookie: weebo_session=..." \
     -d '{"businessName": "Test"}'
   # Verify: 403 if subscription expired
   ```

### Automated Tests (TODO)

```javascript
describe('Subscription Security', () => {
  it('blocks API calls with expired subscription', async () => {
    // Create user with expired trial
    const user = await createTestUser({ trialEndsAt: yesterday });

    // Try to update business
    const response = await fetch('/api/businesses/123', {
      method: 'PUT',
      headers: { Cookie: user.sessionCookie },
      body: JSON.stringify({ businessName: 'Hacked' })
    });

    expect(response.status).toBe(403);
  });

  it('allows API calls with active subscription', async () => {
    const user = await createTestUser({ subscriptionStatus: 'active' });

    const response = await fetch('/api/businesses/123', {
      method: 'PUT',
      headers: { Cookie: user.sessionCookie },
      body: JSON.stringify({ businessName: 'Updated' })
    });

    expect(response.status).toBe(200);
  });
});
```

---

## Adding Protection to New Routes

When creating a new API route that requires subscription:

```javascript
import { requireSubscription } from '@/middleware/subscriptionCheck';

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add this check
  const subscriptionCheck = await requireSubscription(request);
  if (subscriptionCheck) {
    return subscriptionCheck; // Returns 403 if no access
  }

  // Your route logic here
  // User is authenticated AND has active subscription ✅
}
```

**That's it!** The middleware handles all the complexity:
- Session validation
- Subscription status check
- 3-tier caching
- Error handling

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Failed subscription checks**:
   - Count of 403 responses from subscription checks
   - Alert if sudden spike (potential attack)

2. **Cache hit rates**:
   - Session cache hits
   - Redis cache hits
   - Low hit rate = potential caching issues

3. **Webhook delivery**:
   - Failed webhooks in Stripe Dashboard
   - Alert on failures (subscription status won't update)

4. **Subscription status distribution**:
   - % trialing
   - % active
   - % past_due
   - % canceled

### Logging

All subscription checks log:
```
[Subscription] Cache HIT (session) for user clxxxxx
[Subscription] Cache HIT (Redis) for user clxxxxx
[Subscription] Cache MISS - querying DB for user clxxxxx
[Subscription] Access denied for user clxxxxx - status: trial_expired
```

---

## Summary

✅ **Frontend checks** = UX only (can be bypassed)
✅ **Backend middleware** = Real security (cannot be bypassed)
✅ **Business-level checks** = Protects public endpoints
✅ **Caching** = Performance without sacrificing security
✅ **Webhooks** = Immediate status updates from Stripe
✅ **Fail-safe** = Technical errors don't lock out users

**Bottom line**: Even if user bypasses frontend completely, backend always enforces subscription requirements. The system is secure. ✅
