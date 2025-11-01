# Stripe Testing Guide

This guide explains how to test the Stripe subscription integration in development mode.

## Quick Start

1. **Set up Stripe Test Mode**
2. **Configure environment variables**
3. **Test subscription flow**
4. **Verify webhooks locally**

---

## 1. Stripe Test Mode Setup

### Create/Access Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create account or log in
3. **Toggle to "Test Mode"** (top-right corner of dashboard)
4. Ensure you're in **Test Mode** for all development work

### Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

### Create Product and Price

1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: Kitsune Pro
   - **Description**: Full access to Kitsune booking system
   - **Pricing model**: Standard pricing
   - **Price**: 200
   - **Currency**: TWD (Taiwan Dollar)
   - **Billing period**: Monthly
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`)
6. Add to `.env.local`:
   ```bash
   STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
   ```

### Enable Stripe Tax (Optional)

1. Go to https://dashboard.stripe.com/test/settings/tax
2. Click **"Enable Stripe Tax"**
3. Set default location to Taiwan
4. This will automatically calculate and collect taxes on checkout

---

## 2. Local Webhook Testing

Webhooks are critical for subscription management. Here's how to test them locally:

### Install Stripe CLI

**macOS**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows**:
Download from https://github.com/stripe/stripe-cli/releases

**Linux**:
```bash
# Debian/Ubuntu
sudo apt-get install stripe

# Or download binary from releases page
```

### Authenticate Stripe CLI

```bash
stripe login
```

This will open your browser for authentication.

### Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Expected output**:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**Copy the webhook secret** and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Keep Stripe CLI Running

Leave this terminal window open while testing. You'll see webhook events in real-time:

```
2025-10-31 12:34:56  --> customer.subscription.created [evt_xxxxx]
2025-10-31 12:35:01  <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxxxx]
```

---

## 3. Test Card Numbers

Stripe provides test cards for different scenarios:

### Success

```
Card Number:       4242 4242 4242 4242
Expiry:            Any future date (e.g., 12/34)
CVC:               Any 3 digits (e.g., 123)
ZIP:               Any 5 digits (e.g., 12345)
```

### Other Test Cards

**Visa (succeeds)**: `4242 4242 4242 4242`
**Mastercard (succeeds)**: `5555 5555 5555 4444`
**Amex (succeeds)**: `3782 822463 10005`

**Card declined**: `4000 0000 0000 0002`
**Insufficient funds**: `4000 0000 0000 9995`
**Attach fails**: `4000 0000 0000 0341`

**3D Secure authentication**: `4000 0025 0000 3155`
**Taiwan card (for local testing)**: `4000 0158 4000 0016`

Full list: https://stripe.com/docs/testing

---

## 4. Testing Workflow

### A. Test Trial Start

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarder** (separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Log in** with LINE account
4. **Create your first business**
5. **Check logs** for:
   ```
   [Subscription] Trial started for user clxxxxxx - ends 2025-11-14T...
   ```

6. **Verify in database**:
   - `trialStartsAt` is set
   - `trialEndsAt` is 14 days from now
   - `subscriptionStatus` = 'trialing'

7. **Check trial banner** appears in dashboard

### B. Test Subscription Flow

1. **Navigate to Billing page**:
   ```
   http://localhost:3000/dashboard/billing
   ```

2. **Click "Subscribe Now"**
   - Should redirect to Stripe Checkout
   - UI should be in your browser's language (or Chinese for Taiwan)

3. **Fill in checkout form**:
   - Email: test@example.com
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
   - Name: Test User
   - ZIP: 12345

4. **Click "Subscribe"**
   - Should redirect back to `/dashboard/billing?success=true`

5. **Check webhook logs** (in Stripe CLI terminal):
   ```
   checkout.session.completed
   customer.subscription.created
   ```

6. **Check application logs**:
   ```
   [Stripe Webhook] Checkout completed: cs_test_xxxxx
   [Stripe Webhook] Subscription created: sub_xxxxx
   [Stripe Webhook] Activated subscription for user clxxxxx
   ```

7. **Verify in database**:
   - `stripeCustomerId` set
   - `stripeSubscriptionId` set
   - `subscriptionStatus` = 'active'

8. **Verify in UI**:
   - Trial banner should disappear
   - Billing page shows "Subscription Active"
   - "Manage Subscription" button appears

### C. Test Customer Portal

1. **Go to Billing page**
2. **Click "Manage Subscription"**
3. **Verify portal opens** with options to:
   - Update payment method
   - Cancel subscription
   - View invoices
   - View payment history

4. **Test cancellation**:
   - Click "Cancel subscription"
   - Confirm cancellation
   - Check webhook:
     ```
     customer.subscription.deleted
     ```
   - Verify status updates to 'canceled'

5. **Check access**:
   - Navigate to `/dashboard/[businessId]`
   - Should redirect to `/dashboard/subscription-required`

### D. Test Trial Expiration

1. **Manually expire trial** (in database):
   ```sql
   UPDATE "BusinessOwner"
   SET "trialEndsAt" = NOW() - INTERVAL '1 day'
   WHERE id = 'your_user_id';
   ```

2. **Reload dashboard**
3. **Verify redirect** to subscription-required page
4. **Test resubscription** works

### E. Test Payment Failure

1. **Use failing card**: `4000 0000 0000 0002`
2. **Attempt to subscribe**
3. **Verify error handling**

---

## 5. Manual Testing Checklist

Copy and use this checklist for thorough testing:

**Trial Flow**:
- [ ] New user → create first business → trial starts
- [ ] Trial banner shows with correct days remaining
- [ ] Trial banner shows warning when ≤3 days left
- [ ] Can access all features during trial
- [ ] Trial expiration blocks access

**Subscription Flow**:
- [ ] Subscribe button works
- [ ] Checkout page opens with correct price (200 TWD)
- [ ] Checkout is localized correctly
- [ ] Test card payment succeeds
- [ ] Webhooks process correctly
- [ ] Database updates correctly
- [ ] Trial banner disappears after subscription
- [ ] "Active" status shows on billing page

**Customer Portal**:
- [ ] Manage button works
- [ ] Portal opens correctly
- [ ] Can view invoices
- [ ] Can update payment method
- [ ] Can cancel subscription
- [ ] Cancellation blocks access immediately

**Access Control**:
- [ ] Trial expired → blocks access
- [ ] Canceled subscription → blocks access
- [ ] Past due → blocks access
- [ ] Can still access billing page when blocked
- [ ] Can still access subscription-required page
- [ ] Logout works when blocked

**Payment Failures**:
- [ ] Declining card shows error
- [ ] Status updates to 'past_due'
- [ ] "Update Payment" button shows
- [ ] Portal link works for past_due status

**Caching**:
- [ ] Multiple page loads don't spam database
- [ ] Check logs for "Cache HIT" messages
- [ ] Subscription status updates quickly after webhook

---

## 6. Trigger Test Events Manually

You can manually trigger webhook events for testing:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted
```

---

## 7. View Test Data in Stripe Dashboard

**Customers**: https://dashboard.stripe.com/test/customers
**Subscriptions**: https://dashboard.stripe.com/test/subscriptions
**Payments**: https://dashboard.stripe.com/test/payments
**Webhooks**: https://dashboard.stripe.com/test/webhooks
**Events**: https://dashboard.stripe.com/test/events
**Logs**: https://dashboard.stripe.com/test/logs

---

## 8. Debugging Tips

### Check Application Logs

Look for these log prefixes:
- `[Stripe]` - Stripe API operations
- `[Stripe Webhook]` - Webhook processing
- `[Subscription]` - Subscription logic and caching

### Check Webhook Delivery

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View event delivery history
4. See request/response for each event

### Common Issues

**Webhook signature verification failed**:
- Make sure `STRIPE_WEBHOOK_SECRET` is correct
- Restart app after changing environment variables

**Webhooks not received locally**:
- Check Stripe CLI is running (`stripe listen`)
- Check firewall isn't blocking port 3000

**Database not updating**:
- Check webhook logs for errors
- Verify Prisma client is generated (`npx prisma generate`)

**Checkout shows wrong price**:
- Verify `STRIPE_PRICE_ID` in `.env.local`
- Make sure price is set to 200 TWD in Stripe Dashboard

---

## 9. Reset Test Data

To start fresh:

**Clear Stripe test data**:
1. Go to https://dashboard.stripe.com/test/developers
2. Click "Delete all test data"
3. Confirm deletion

**Reset database**:
```bash
# Clear subscription data for all users
npx prisma studio
# Manually set subscription fields to null
```

---

## 10. Moving to Production

When ready to go live:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create live product/price** (same as test)
3. **Get live API keys** from https://dashboard.stripe.com/apikeys
4. **Update production environment** (`.env.production`):
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_PRICE_ID=price_xxxxx  # Live price ID
   ```
5. **Create webhook** in Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: Select all `customer.subscription.*` and `invoice.*`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

6. **Test with real card** (use small amount first!)
7. **Monitor live webhooks** closely at first

---

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
