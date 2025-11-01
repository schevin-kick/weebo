# Quick Start - Stripe Testing

Your Stripe integration is fully configured! Here's how to test it:

## ✅ Environment Setup Complete

All Stripe keys are configured in `.env`:
- ✅ Publishable key
- ✅ Secret key
- ✅ Price ID (configurable via env vars)
- ✅ Webhook secret
- ✅ Subscription config (200 TWD/month, 14-day trial)

---

## 🚀 Testing Workflow

### Terminal 1: Start Your App

```bash
npm run dev
```

App runs at: https://cozies-unentreated-aleen.ngrok-free.dev

---

### Terminal 2: Start Stripe Webhook Listener

Since your ngrok URL changes, the webhook listener automatically uses your `NEXTAUTH_URL`:

```bash
npm run stripe:listen
```

This forwards webhooks from Stripe to your ngrok URL.

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

⚠️ **Important**: If your ngrok URL changes, you need to:
1. Update `NEXTAUTH_URL` in `.env`
2. Restart the webhook listener with `npm run stripe:listen`

---

## 🧪 Test the Flow

### 1. Create First Business (Starts Trial)

1. Log in with LINE: https://cozies-unentreated-aleen.ngrok-free.dev/api/auth/login
2. Create your first business
3. **Watch for**: Trial banner appears showing "14 days remaining"

**Check logs:**
```
[Subscription] Trial started for user clxxxxx - ends 2025-11-15T...
```

### 2. Subscribe to Kitsune Pro

1. Go to billing page: `/dashboard/billing`
2. Click **"Subscribe Now"**
3. You'll be redirected to Stripe Checkout
4. Fill in:
   - **Email**: test@example.com
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34`
   - **CVC**: `123`
   - **Name**: Test User
   - **Postal**: `12345`
5. Click **"Subscribe"**

**Watch Terminal 2 for webhooks:**
```
checkout.session.completed
customer.subscription.created
```

**Check logs:**
```
[Stripe Webhook] Checkout completed: cs_test_xxxxx
[Stripe Webhook] Subscription created: sub_xxxxx
[Stripe Webhook] Activated subscription for user clxxxxx
```

**Verify:**
- ✅ Redirected to billing page with success message
- ✅ Trial banner disappears
- ✅ Status shows "Subscription Active"
- ✅ "Manage Subscription" button appears

### 3. Test Customer Portal

1. Click **"Manage Subscription"**
2. Portal opens (Stripe-hosted page)
3. You can:
   - Update payment method
   - Cancel subscription
   - View invoices
   - Download receipts

### 4. Test Cancellation

1. In Customer Portal, click **"Cancel subscription"**
2. Confirm cancellation

**Watch Terminal 2:**
```
customer.subscription.deleted
```

**Verify:**
- ✅ Navigate to `/dashboard/[businessId]`
- ✅ Redirected to `/dashboard/subscription-required`
- ✅ Shows "Subscribe to Continue" page

### 5. Test Resubscription

1. On subscription-required page, click **"Subscribe Now"**
2. Complete checkout again
3. Access restored ✅

---

## 🎨 What You'll See

### Trial Banner (First 14 Days)
```
ℹ️ Free trial: 11 days remaining                [View Billing]
```

### Trial Warning (≤3 Days)
```
⚠️ Trial ends in 2 days! Subscribe now to keep your business running smoothly.  [Subscribe Now]
```

### Active Subscription
No banner, just normal dashboard access.

### Expired/Canceled
Redirected to subscription-required page with subscribe button.

---

## 🧹 Reset Test Data

### Clear Stripe Test Data

1. Go to https://dashboard.stripe.com/test/developers
2. Click **"Delete all test data"**
3. Confirm

### Reset Database Subscriptions

```bash
npx prisma studio
```

Then manually set subscription fields to `null` for test users.

---

## 🐛 Troubleshooting

### Webhooks not working

**Check:**
1. Is `npm run stripe:listen` running?
2. Does `NEXTAUTH_URL` in `.env` match your current ngrok URL?
3. Check Terminal 2 for errors

**Fix:**
```bash
# Update NEXTAUTH_URL in .env to current ngrok URL
# Then restart webhook listener
npm run stripe:listen
```

### Wrong price showing in checkout

**Check:**
1. Go to https://dashboard.stripe.com/test/products
2. Verify price is 200 TWD (not USD!)
3. Check `STRIPE_PRICE_ID` in `.env` matches

### Subscription status not updating

**Check:**
1. Look at Terminal 2 for webhook delivery
2. Check application logs for `[Stripe Webhook]` messages
3. Go to https://dashboard.stripe.com/test/webhooks to see delivery status

**Manual sync:**
```javascript
// In browser console on billing page
fetch('/api/subscription/status').then(r => r.json()).then(console.log)
```

---

## 📊 Monitor in Stripe Dashboard

- **Customers**: https://dashboard.stripe.com/test/customers
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Payments**: https://dashboard.stripe.com/test/payments
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Events**: https://dashboard.stripe.com/test/events

---

## 🔄 When Ngrok URL Changes

Your ngrok URL (`https://cozies-unentreated-aleen.ngrok-free.dev`) will change when you restart ngrok.

**Steps to update:**

1. **Update `.env`**:
   ```bash
   NEXTAUTH_URL="https://your-new-ngrok-url.ngrok-free.dev"
   ```

2. **Restart webhook listener**:
   ```bash
   npm run stripe:listen
   ```

3. **Copy new webhook secret** from output and update `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_new_secret_here"
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

---

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Start webhook forwarder (uses NEXTAUTH_URL from .env)
npm run stripe:listen

# Start ngrok
npm run ngrok

# View Stripe CLI help
stripe --help

# Manually trigger test webhook
stripe trigger customer.subscription.created
```

---

## ✨ You're Ready!

Everything is configured. Just run:

1. **Terminal 1**: `npm run dev`
2. **Terminal 2**: `npm run stripe:listen`
3. Open https://cozies-unentreated-aleen.ngrok-free.dev
4. Create a business and start testing!

For more details, see:
- [STRIPE_TESTING.md](STRIPE_TESTING.md) - Complete testing guide
- [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) - Setup documentation
- [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md) - Security architecture
