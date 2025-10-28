/**
 * Script to fix missing or incorrect lineDeepLink for businesses
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load LIFF ID from environment
require('dotenv').config();
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID;

async function fixLineDeepLinks() {
  try {
    if (!LIFF_ID) {
      console.error('❌ NEXT_PUBLIC_LIFF_ID not found in environment variables');
      return;
    }

    console.log(`Using LIFF ID: ${LIFF_ID}\n`);

    // Find all businesses
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        businessName: true,
        lineDeepLink: true
      }
    });

    console.log(`Found ${businesses.length} businesses\n`);

    let updatedCount = 0;

    for (const business of businesses) {
      const correctLink = `https://liff.line.me/${LIFF_ID}?business_id=${business.id}`;
      const needsUpdate = business.lineDeepLink !== correctLink;

      console.log(`${business.businessName} (${business.id}):`);
      console.log(`  Current:  ${business.lineDeepLink || 'MISSING'}`);
      console.log(`  Expected: ${correctLink}`);

      if (needsUpdate) {
        console.log(`  → Updating...`);
        await prisma.business.update({
          where: { id: business.id },
          data: { lineDeepLink: correctLink }
        });
        updatedCount++;
        console.log(`  ✓ Updated\n`);
      } else {
        console.log(`  ✓ Already correct\n`);
      }
    }

    console.log(`\n✓ Complete! Updated ${updatedCount} business(es)`);
  } catch (error) {
    console.error('Error fixing lineDeepLinks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLineDeepLinks();
