# Localization Implementation Guide

## ✅ Completed Work

### Infrastructure (100% Complete)
- ✅ next-intl installed and configured
- ✅ i18n routing setup ([src/i18n/routing.js](src/i18n/routing.js), [src/i18n/request.js](src/i18n/request.js))
- ✅ Translation files created with 620+ strings ([src/messages/en.json](src/messages/en.json), [src/messages/zh-tw.json](src/messages/zh-tw.json))
- ✅ Middleware updated with Vercel Geo detection ([src/middleware.js](src/middleware.js))
- ✅ Next.js config updated ([next.config.mjs](next.config.mjs))
- ✅ App router restructured with `[locale]` segment
- ✅ Root and locale layouts configured
- ✅ Language Selector component created ([src/components/shared/LanguageSelector.jsx](src/components/shared/LanguageSelector.jsx))

### Pages (Partially Complete)
- ✅ **Brochure page** - 100% translated ([src/app/[locale]/brochure/page.js](src/app/[locale]/brochure/page.js))
- ⏳ Booking flow pages - Need translation
- ⏳ Dashboard pages - Need translation
- ⏳ Setup wizard - Need translation
- ⏳ Error pages - Need translation

---

## 🔄 Remaining Work

### Pattern to Follow

Every file that displays user-facing text needs to be updated following this simple pattern:

#### 1. Import useTranslations

```javascript
// At the top of the file
import { useTranslations } from 'next-intl';
```

#### 2. Get Translation Function in Component

```javascript
export default function MyComponent() {
  const t = useTranslations('namespace'); // e.g., 'booking', 'dashboard', 'common'

  // ... rest of component
}
```

#### 3. Replace Hardcoded Strings

```javascript
// BEFORE:
<h1>Welcome</h1>
<button>Save</button>
<p>Please enter your name</p>

// AFTER:
<h1>{t('title')}</h1>
<button>{t('buttons.save')}</button>
<p>{t('forms.enterName')}</p>
```

#### 4. For Cross-Namespace References

```javascript
// If you need to access 'common' translations from a 'booking' component:
const t = useTranslations('booking');
const tCommon = useTranslations('common');

<button>{tCommon('buttons.save')}</button>
```

OR use relative paths:

```javascript
const t = useTranslations('booking');

<button>{t('../common.buttons.save')}</button>
```

---

## 📋 Files Needing Translation

### Booking Components (Priority 1)

All files in [src/components/booking/](src/components/booking/):

1. **BookingSuccess.js** - Update strings like:
   ```javascript
   // Line 123-124
   <h1>Booking Confirmed!</h1>
   <p>Your appointment has been successfully scheduled</p>

   // Should become:
   const t = useTranslations('booking.success');
   <h1>{t('title')}</h1>
   <p>{t('description')}</p>
   ```

2. **BookingError.js** - Error messages
3. **PresetServicePage.js** - Service selection UI
4. **PresetStaffPage.js** - Staff selection UI
5. **PresetDateTimePage.js** - Date/time picker UI
6. **CustomFieldsPage.js** - Form fields
7. **ReviewConfirmPage.js** - Review screen
8. **BookingStepper.js** - Step labels
9. **BookingNavigation.js** - Navigation buttons

**Translation keys already exist in [src/messages/en.json](src/messages/en.json) under `booking.*`**

### Dashboard Pages (Priority 2)

All files in [src/app/[locale]/dashboard/](src/app/[locale]/dashboard/):

1. **page.js** - Business selector
2. **[businessId]/page.js** - Main dashboard
3. **[businessId]/calendar/page.js** - Calendar view
4. **[businessId]/bookings/page.js** - Bookings list
5. **[businessId]/settings/page.js** - Settings UI
6. **[businessId]/analytics/page.js** - Analytics dashboard
7. **[businessId]/messaging/page.js** - LINE messaging
8. **[businessId]/qr-code/page.js** - QR code generator
9. **[businessId]/holiday-hours/page.js** - Hours management
10. **billing/page.js** - Billing UI
11. **subscription-required/page.js** - Subscription prompt

**Translation keys exist in [src/messages/en.json](src/messages/en.json) under `dashboard.*`**

### Dashboard Components (Priority 3)

All files in [src/components/dashboard/](src/components/dashboard/) - Update labels, titles, messages

### Shared Components (Priority 4)

Files in [src/components/shared/](src/components/shared/) that contain text:
- Form components
- Modal components
- Navigation components
- Status indicators
- etc.

### Setup Wizard (Priority 5)

All files in [src/app/[locale]/setup/](src/app/[locale]/setup/)

### Error Pages (Priority 6)

1. [src/app/[locale]/error.js](src/app/[locale]/error.js)
2. [src/app/[locale]/not-found.js](src/app/[locale]/not-found.js)
3. [src/app/[locale]/global-error.js](src/app/[locale]/global-error.js)

---

## 🎯 Special Cases

### LINE Message Templates

**File**: [src/lib/messageTemplates.js](src/lib/messageTemplates.js)

This needs a different approach since it runs server-side:

```javascript
// Current structure:
export const DEFAULT_TEMPLATES = {
  confirmation: {
    header: 'Your booking is confirmed!',
    body: 'We look forward to seeing you!',
  },
  // ...
};

// Should become (use locale parameter):
export function getLocalizedTemplates(locale = 'en') {
  const templates = {
    en: {
      confirmation: {
        header: 'Your booking is confirmed!',
        body: 'We look forward to seeing you!',
      },
      // ...
    },
    'zh-tw': {
      confirmation: {
        header: '您的預約已確認！',
        body: '我們期待見到您！',
      },
      // ...
    },
  };

  return templates[locale] || templates.en;
}

// Update getMessageTemplate function to accept locale:
export function getMessageTemplate(business, type, locale = 'en') {
  // ... existing logic
  const defaultTemplates = getLocalizedTemplates(locale);
  // ... rest of function
}
```

### Toast Notifications

**File**: [src/contexts/ToastContext.js](src/contexts/ToastContext.js)

Toasts should use translations:

```javascript
// Wrap ToastProvider with locale context
import { useTranslations } from 'next-intl';

// In components that show toasts:
const t = useTranslations('errors'); // or 'common.messages'

showToast({
  type: 'success',
  message: t('saveSuccess')
});
```

---

## 🚀 Testing Checklist

After updating each file:

1. **Visit the English route**: `http://localhost:3000/en/page-name`
   - Verify all text displays correctly
   - Check for any untranslated strings

2. **Visit the Chinese route**: `http://localhost:3000/zh-tw/page-name`
   - Verify all text displays in Chinese
   - Check layout doesn't break (Chinese text can be longer/shorter)

3. **Test Language Selector**:
   - Click the globe icon (top-right)
   - Switch languages
   - Verify URL updates and content changes

4. **Test Navigation**:
   - Ensure internal links preserve locale
   - Use next-intl's `Link` component from `@/i18n/routing` for navigation

---

## 📦 Translation Keys Reference

All translation keys are in:
- [src/messages/en.json](src/messages/en.json) - English
- [src/messages/zh-tw.json](src/messages/zh-tw.json) - Traditional Chinese

### Key Structure:

```json
{
  "common": {
    "buttons": { ... },
    "navigation": { ... },
    "time": { ... },
    "status": { ... }
  },
  "brochure": { ... },
  "booking": {
    "steps": { ... },
    "service": { ... },
    "staff": { ... },
    "dateTime": { ... },
    "customFields": { ... },
    "review": { ... },
    "success": { ... },
    "error": { ... },
    "validation": { ... }
  },
  "dashboard": {
    "welcome": "...",
    "selectBusiness": "...",
    "home": { ... }
  },
  "errors": { ... },
  "messages": { ... }
}
```

---

## 💡 Tips

1. **Don't hardcode any user-facing text** - Always use translations
2. **Use descriptive key names** - `buttons.save` not `btn1`
3. **Test both locales** - Some translations might be longer/shorter
4. **Add Language Selector to pages** - Import and place `<LanguageSelector />` component
5. **Use relative paths sparingly** - Prefer explicit namespace declarations
6. **Handle plurals** - next-intl supports ICU message format:
   ```json
   {
     "items": "{count, plural, =0 {No items} one {1 item} other {# items}}"
   }
   ```

---

## 🎉 When You're Done

1. Run full test of all routes in both locales
2. Check for console errors
3. Verify Vercel Geo detection (Taiwan users → zh-tw)
4. Test language selector persistence (cookie)
5. Check SEO metadata (`hreflang` tags)

---

## 📞 Need Help?

All infrastructure is complete and working. The pattern is simple and repetitive. If you encounter issues:

1. Check the brochure page for reference: [src/app/[locale]/brochure/page.js](src/app/[locale]/brochure/page.js)
2. Ensure you're using `useTranslations` from `'next-intl'`
3. Verify translation keys exist in JSON files
4. Check namespace matches your translation file structure

Good luck! The hard part is done - now it's just following the pattern systematically.
