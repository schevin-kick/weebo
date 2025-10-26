# Kitsune Booking - MVP Setup Wizard

LINE bot-based booking system for SMBs in Thailand/Taiwan. Businesses setup in 5 minutes, customers book via LINE QR codes.

## Tech Stack
- **Framework:** Next.js (App Router, JavaScript)
- **Database:** Neon PostgreSQL + Prisma ORM
- **Storage:** Cloudflare R2 (logos/QR codes)
- **Styling:** Tailwind CSS v3 + SCSS
- **i18n:** English (expandable to Thai/Mandarin/Japanese)

## LINE Integration Overview

### What is LINE?
LINE is Asia's dominant messaging app (95M+ users in Japan, 52M+ in Thailand, 21M+ in Taiwan). Think WhatsApp meets WeChat - it's THE primary communication channel for businesses in these markets.

### LINE Official Accounts (Bots)
- **Official Accounts** are LINE's business/bot accounts
- **Our Bot:** One centralized bot (`@kitsunebook`) serves ALL businesses
- **Deep Linking:** Each business gets unique QR code with `business_id` parameter
- **Discovery:** Customers scan QR at business → directly adds bot → no searching needed

### How Customers Interact
1. Customer scans business's QR code at salon/cafe
2. Opens LINE app → "Add @kitsunebook as friend"
3. Bot immediately knows which business (via deep link)
4. Bot starts booking conversation using **LINE Messaging API components**

### LINE Bot Components Available

Our bot can use these LINE UI components in conversations:

**Text Messages:**
- Plain text responses
- Supports emojis, line breaks

**Quick Reply Buttons:**
- Bubble buttons above keyboard
- Up to 13 options per message
- Perfect for: service selection, date/time picking, yes/no
- Disappear after user taps

**Flex Messages:**
- Customizable JSON-based card layouts
- Can include: images (logos), text, buttons, pricing
- Perfect for: booking confirmations, service menus
- Example: Confirmation card with logo at top, details below, action buttons

**Carousel:**
- Horizontally swipeable cards
- Up to 10 cards
- Perfect for: browsing staff members, service categories

**Template Messages:**
- Pre-built templates (buttons, confirm dialogs)
- Simpler than Flex Messages
- Perfect for: quick confirmations

**Postback Actions:**
- Buttons that send data back to bot without showing message
- Perfect for: "Confirm Booking" → bot receives structured data

