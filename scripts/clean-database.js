/**
 * Clean Database Script
 * Removes all data from all tables in the correct order
 * WARNING: This cannot be undone!
 */

import prisma from '../src/lib/prisma.js';

async function cleanDatabase() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Delete in order to respect foreign key constraints
    // Child tables first, then parent tables

    console.log('Deleting BookingMessages...');
    const bookingMessages = await prisma.bookingMessage.deleteMany();
    console.log(`✓ Deleted ${bookingMessages.count} booking messages`);

    console.log('Deleting Bookings...');
    const bookings = await prisma.booking.deleteMany();
    console.log(`✓ Deleted ${bookings.count} bookings`);

    console.log('Deleting ClosedDates...');
    const closedDates = await prisma.closedDate.deleteMany();
    console.log(`✓ Deleted ${closedDates.count} closed dates`);

    console.log('Deleting Pages...');
    const pages = await prisma.page.deleteMany();
    console.log(`✓ Deleted ${pages.count} pages`);

    console.log('Deleting Staff...');
    const staff = await prisma.staff.deleteMany();
    console.log(`✓ Deleted ${staff.count} staff members`);

    console.log('Deleting Services...');
    const services = await prisma.service.deleteMany();
    console.log(`✓ Deleted ${services.count} services`);

    console.log('Deleting Businesses...');
    const businesses = await prisma.business.deleteMany();
    console.log(`✓ Deleted ${businesses.count} businesses`);

    console.log('Deleting Customers...');
    const customers = await prisma.customer.deleteMany();
    console.log(`✓ Deleted ${customers.count} customers`);

    console.log('Deleting BusinessOwners...');
    const businessOwners = await prisma.businessOwner.deleteMany();
    console.log(`✓ Deleted ${businessOwners.count} business owners`);

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Business Owners: ${businessOwners.count}`);
    console.log(`  - Businesses: ${businesses.count}`);
    console.log(`  - Customers: ${customers.count}`);
    console.log(`  - Services: ${services.count}`);
    console.log(`  - Staff: ${staff.count}`);
    console.log(`  - Pages: ${pages.count}`);
    console.log(`  - Bookings: ${bookings.count}`);
    console.log(`  - Booking Messages: ${bookingMessages.count}`);
    console.log(`  - Closed Dates: ${closedDates.count}`);

  } catch (error) {
    console.error('\n❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => {
    console.log('\n👋 Disconnected from database');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
