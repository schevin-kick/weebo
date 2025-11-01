# Stripe Setup Guide

Complete guide for setting up Stripe subscriptions in Kitsune.

## Overview

Kitsune uses Stripe for subscription management with the following flow:

1. **Configurable free trial** - Starts when user creates their first business (default: 14 days)
2. **Configurable subscription pricing** - Automatically begins after trial ends (default: 200 TWD/month)
3. **Hard access block** - No access after trial/subscription expires until payment
4. **Self-service management** - Users can manage subscriptions via Stripe Customer Portal
5. **Multi-country support** - Pricing and currency configured via environment variables

### Pricing Configuration

The subscription price, currency, and trial duration are fully configurable via environment variables, making it easy to deploy Kitsune in different countries:

```bash
SUBSCRIPTION_PRICE_AMOUNT=200      # Price amount (e.g., 200, 9.99, 1500)
SUBSCRIPTION_PRICE_CURRENCY=TWD    # ISO currency code (TWD, USD, EUR, JPY, etc.)
SUBSCRIPTION_TRIAL_DAYS=14         # Trial duration in days
```

**Examples for different markets:**
- **Taiwan**: `200 TWD`, 14-day trial
- **USA**: `9.99 USD`, 7-day trial
- **Japan**: `1500 JPY`, 30-day trial
- **Europe**: `8.99 EUR`, 14-day trial

**Important**: The `STRIPE_PRICE_ID` must match the currency you create in Stripe Dashboard. If you change currency, you must create a new price in Stripe.

---

## Prerequisites

Before starting, you need:

- [ ] Stripe account (create at https://stripe.com)
- [ ] Taiwan business registration (for tax compliance)
- [ ] Database with Prisma (already configured)
- [ ] Upstash Redis (already configured for caching)

---

## Step 1: Stripe Account Setup

### Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Complete registration
3. Verify your email address
4. Complete business verification (required for production)

### Configure Account Settings

1. **Set business details**:
   - Go to https://dashboard.stripe.com/settings/account
   - Set business name: "Kitsune Booking"
   - Set country: Taiwan
   - Complete business profile

2. **Enable Stripe Tax** (recommended):
   - Go to https://dashboard.stripe.com/settings/tax
   - Click "Enable Stripe Tax"
   - Set default tax location to Taiwan
   - This automatically handles consumption tax (VAT)

3. **Configure Customer Portal**:
   - Go to https://dashboard.stripe.com/settings/billing/portal
   - Enable features you want:
     - ✅ Update payment methods
     - ✅ Cancel subscriptions
     - ✅ View invoices
     - ✅ View payment history
   - Set cancellation behavior:
     - **Recommended**: Cancel immediately (matches hard-block behavior)
   - Save settings

---

## Step 2: Create Product and Price

### Test Mode (Development)

1. **Switch to Test Mode**:
   - Click "Test mode" toggle in top-right of dashboard
   - Ensure you're in TEST mode (important!)

2. **Create Test Product**:
   - Go to https://dashboard.stripe.com/test/products
   - Click "+ Add product"
   - Fill in:
     - **Name**: Kitsune Pro
     - **Description**: Full access to Kitsune booking management system
     - **Image**: Upload your logo (optional)
   - Click "Add pricing"
     - **Price**: 200
     - **Currency**: TWD (Taiwan Dollar)
     - **Billing period**: Monthly
     - **Type**: Standard pricing (not metered)
   - Click "Save product"

3. **Copy Price ID**:
   - Find the price in the Prices section
   - Click to expand
   - Copy the **Price ID** (format: `price_xxxxxxxxxxxxx`)
   - Save for environment variable setup

### Live Mode (Production)

Repeat the same steps but:
1. Switch to **Live Mode** in dashboard
2. Create the same product/price
3. Copy the **live Price ID** (different from test)

---

## Step 3: Get API Keys

### Test Mode Keys (Development)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" for **Secret key** (starts with `sk_test_`)
4. Save both keys securely

### Live Mode Keys (Production)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_live_`)
3. Click "Reveal live key" for **Secret key** (starts with `sk_live_`)
4. Save both keys securely
5. **⚠️ Never commit live keys to git!**

---

## Step 4: Environment Variable Setup

### Development (`.env.local`)

Create/update `.env.local`:

```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx

# Webhook secret (from Stripe CLI - see Step 5)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Subscription Configuration (for multi-country support)
SUBSCRIPTION_PRICE_AMOUNT=200
SUBSCRIPTION_PRICE_CURRENCY=TWD
SUBSCRIPTION_TRIAL_DAYS=14

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### Production (Environment Variables on Hosting Platform)

Set these on your hosting platform (Vercel, Heroku, etc.):

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx  # LIVE price ID
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # From Step 6

# Subscription Configuration (adjust for your target market)
SUBSCRIPTION_PRICE_AMOUNT=200
SUBSCRIPTION_PRICE_CURRENCY=TWD
SUBSCRIPTION_TRIAL_DAYS=14

NEXTAUTH_URL=https://yourdomain.com
```

---

## Step 5: Local Webhook Setup (Development)

Webhooks are critical for subscription updates. For local development:

### Install Stripe CLI

**macOS**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows**:
Download from https://github.com/stripe/stripe-cli/releases

**Linux**:
```bash
# Download latest release for your platform
wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_*.tar.gz
sudo mv stripe /usr/local/bin/
```

### Authenticate

```bash
stripe login
```

This opens your browser for authentication.

### Forward Webhooks to Localhost

In a separate terminal (keep it running):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copy the webhook signing secret** (starts with `whsec_`) and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Restart your dev server** after updating environment variables:

```bash
npm run dev
```

---

## Step 6: Production Webhook Setup

For production, create a webhook endpoint in Stripe Dashboard:

### Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Fill in:
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Description**: Kitsune subscription webhooks
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

   Or select **"Select all customer events"** and **"Select all invoice events"**

4. Click "Add endpoint"

### Get Webhook Signing Secret

1. Click on the webhook you just created
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your production environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Test Webhook

1. Click "Send test webhook"
2. Select event: `customer.subscription.created`
3. Send
4. Check your application logs for:
   ```
   [Stripe Webhook] Received event: customer.subscription.created
   ```

---

## Step 7: Verify Setup

### Checklist

- [ ] Stripe account created and verified
- [ ] Stripe Tax enabled
- [ ] Customer Portal configured
- [ ] Test product created (200 TWD/month)
- [ ] Live product created (200 TWD/month)
- [ ] Test API keys added to `.env.local`
- [ ] Live API keys added to production environment
- [ ] Stripe CLI installed (for development)
- [ ] Local webhooks working (stripe listen running)
- [ ] Production webhook endpoint created
- [ ] Environment variables set correctly

### Test the Integration

Follow the testing guide in [STRIPE_TESTING.md](../STRIPE_TESTING.md).

Quick test:
1. Start app: `npm run dev`
2. Start webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Create first business → trial starts
4. Go to `/dashboard/billing`
5. Click "Subscribe Now"
6. Use test card: `4242 4242 4242 4242`
7. Complete checkout
8. Verify webhook received and processed
9. Check subscription is active

---

## Architecture Overview

### How It Works

```
User Flow:
1. User logs in with LINE
2. Creates first business → Trial starts (14 days)
3. Trial countdown shows in banner
4. At 3 days left, banner shows urgent warning
5. User clicks "Subscribe" → Stripe Checkout
6. Pays 200 TWD → Subscription activates
7. Monthly billing continues automatically

Access Control:
- Pre-trial: Full access (before first business)
- Trialing: Full access (14 days)
- Trial expired + no payment: Hard block
- Active subscription: Full access
- Past due / Canceled: Hard block
```

### Caching Strategy

To minimize costs and improve performance, we use **3-tier caching**:

```
API Request → Session Cache (1 hour) → Redis Cache (10 min) → Database
     ↓              ↓                       ↓                    ↓
   <1ms           <1ms                   ~5ms                 ~50ms
```

**Benefits**:
- 97% cost reduction on database queries
- <1ms average latency for subscription checks
- Automatic invalidation via webhooks

### Database Schema

Subscription fields added to `BusinessOwner`:

```prisma
model BusinessOwner {
  // ... existing fields

  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  subscriptionStatus    String?   // 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  trialStartsAt         DateTime?
  trialEndsAt           DateTime?
  currentPeriodEnd      DateTime?
  canceledAt            DateTime?
}
```

---

## Key Files Reference

### Backend
- [/src/lib/stripe.js](../src/lib/stripe.js) - Stripe SDK client
- [/src/lib/subscriptionHelpers.js](../src/lib/subscriptionHelpers.js) - Trial & access logic
- [/src/app/api/stripe/create-checkout-session/route.js](../src/app/api/stripe/create-checkout-session/route.js) - Checkout
- [/src/app/api/stripe/webhook/route.js](../src/app/api/stripe/webhook/route.js) - Webhook handler
- [/src/app/api/stripe/portal/route.js](../src/app/api/stripe/portal/route.js) - Customer Portal
- [/src/app/api/subscription/status/route.js](../src/app/api/subscription/status/route.js) - Status endpoint

### Frontend
- [/src/components/TrialBanner.js](../src/components/TrialBanner.js) - Trial countdown
- [/src/components/SubscriptionCheck.js](../src/components/SubscriptionCheck.js) - Access guard
- [/src/app/dashboard/billing/page.js](../src/app/dashboard/billing/page.js) - Billing management
- [/src/app/dashboard/subscription-required/page.js](../src/app/dashboard/subscription-required/page.js) - Paywall

### Configuration
- [/.env.local.template](../.env.local.template) - Environment variables template
- [/prisma/schema.prisma](../prisma/schema.prisma) - Database schema

---

## Maintenance

### Monitor Subscriptions

**Stripe Dashboard**:
- https://dashboard.stripe.com/subscriptions
- View all active subscriptions
- See revenue metrics
- Track churned customers

**Webhook Logs**:
- https://dashboard.stripe.com/webhooks
- Monitor webhook delivery
- Retry failed webhooks
- Debug issues

### Handle Payment Failures

Stripe automatically:
- Retries failed payments (Smart Retries)
- Sends email notifications to customers
- Updates subscription status to `past_due`

Your app automatically:
- Blocks access for `past_due` status
- Shows "Update Payment Method" button
- Redirects to Customer Portal

### Subscription Statuses

| Status | Meaning | User Access | Action |
|--------|---------|-------------|--------|
| `pre_trial` | Before first business | ✅ Full | None |
| `trialing` | In 14-day trial | ✅ Full | Show banner |
| `active` | Paid subscription | ✅ Full | None |
| `past_due` | Payment failed | ❌ Blocked | Prompt payment update |
| `canceled` | User canceled | ❌ Blocked | Offer resubscription |
| `unpaid` | Multiple failures | ❌ Blocked | Contact support |

---

## Troubleshooting

### Webhooks Not Received

**Local Development**:
- Check `stripe listen` is running
- Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
- Restart dev server after env change

**Production**:
- Check webhook endpoint URL is correct
- Verify webhook signing secret is correct
- Check application logs for errors
- Use Stripe Dashboard to retry failed events

### Subscription Status Not Updating

1. Check webhook delivery in Dashboard
2. Check application logs for errors
3. Manually sync: Call `syncStripeSubscription(userId)`
4. Clear Redis cache: `redis.del('subscription:userId')`

### Checkout Not Working

- Verify `STRIPE_PRICE_ID` is correct
- Check price is active in Stripe Dashboard
- Ensure Stripe keys match environment (test vs live)
- Check browser console for errors

### User Stuck in Trial

- Check `trialEndsAt` in database
- Verify webhook for subscription creation was processed
- Manually update status if needed

---

## Security Best Practices

1. **Never commit secrets**:
   - Add `.env.local` to `.gitignore`
   - Use environment variables on hosting platform
   - Rotate keys if accidentally exposed

2. **Verify webhook signatures**:
   - Always verify `stripe-signature` header
   - Reject webhooks with invalid signatures
   - Use correct webhook secret for environment

3. **Use HTTPS in production**:
   - Stripe requires HTTPS for webhooks
   - Redirect HTTP to HTTPS

4. **Test in Test Mode first**:
   - Always use test keys in development
   - Test all flows before going live
   - Keep test and live data separate

---

## Going Live Checklist

- [ ] Business verification completed in Stripe
- [ ] Live product/price created
- [ ] Live API keys obtained
- [ ] Production webhook endpoint created and tested
- [ ] Environment variables updated with live keys
- [ ] Tested full flow with real (small amount) card
- [ ] Customer Portal configured correctly
- [ ] Tax settings verified for Taiwan
- [ ] Monitoring/alerts set up for failed payments
- [ ] Customer support email configured in Stripe

---

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Subscription Billing Guide**: https://stripe.com/docs/billing/subscriptions/overview
- **Webhooks**: https://stripe.com/docs/webhooks
- **Testing**: https://stripe.com/docs/testing
- **Tax**: https://stripe.com/docs/tax

---

## Next Steps

1. Complete this setup guide
2. Follow [STRIPE_TESTING.md](../STRIPE_TESTING.md) for testing
3. Test thoroughly in test mode
4. Deploy to staging environment
5. Go live with production keys
6. Monitor webhooks and payments closely
