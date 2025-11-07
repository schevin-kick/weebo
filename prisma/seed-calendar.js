/**
 * Calendar Seed Script
 * Populates the database with realistic mock data for calendar testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BUSINESS_ID = 'biz_1762380323861_093ish';

// Mock data definitions
const SERVICES = [
  {
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling service',
    duration: 45,
    price: 6500, // in cents
    isActive: true,
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products',
    duration: 90,
    price: 12000,
    isActive: true,
  },
  {
    name: 'Massage Therapy',
    description: 'Relaxing full-body massage therapy',
    duration: 60,
    price: 9000,
    isActive: true,
  },
  {
    name: 'Facial Treatment',
    description: 'Deep cleansing facial treatment',
    duration: 50,
    price: 7500,
    isActive: true,
  },
  {
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service',
    duration: 40,
    price: 5500,
    isActive: true,
  },
];

const STAFF = [
  {
    name: 'Sarah Chen',
    specialty: 'Hair Styling Expert',
    description: '10+ years of experience in hair styling and coloring',
    photoUrl: 'https://i.pravatar.cc/150?img=5',
    isActive: true,
    availability: {
      monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: true, slots: [{ start: '10:00', end: '16:00' }] },
      sunday: { enabled: false, slots: [] },
    },
  },
  {
    name: 'Michael Torres',
    specialty: 'Massage Therapist',
    description: 'Licensed massage therapist specializing in deep tissue',
    photoUrl: 'https://i.pravatar.cc/150?img=12',
    isActive: true,
    availability: {
      monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: true, slots: [{ start: '10:00', end: '16:00' }] },
      sunday: { enabled: false, slots: [] },
    },
  },
  {
    name: 'Emma Rodriguez',
    specialty: 'Skincare Specialist',
    description: 'Expert in facial treatments and skincare',
    photoUrl: 'https://i.pravatar.cc/150?img=9',
    isActive: true,
    availability: {
      monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: true, slots: [{ start: '10:00', end: '16:00' }] },
      sunday: { enabled: false, slots: [] },
    },
  },
  {
    name: 'David Kim',
    specialty: 'Nail Technician',
    description: 'Professional nail care and design specialist',
    photoUrl: 'https://i.pravatar.cc/150?img=13',
    isActive: true,
    availability: {
      monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: true, slots: [{ start: '10:00', end: '16:00' }] },
      sunday: { enabled: false, slots: [] },
    },
  },
];

const CUSTOMERS = [
  { lineUserId: 'U001mock', displayName: 'Jennifer Lee', pictureUrl: 'https://i.pravatar.cc/150?img=1', language: 'en' },
  { lineUserId: 'U002mock', displayName: 'Robert Smith', pictureUrl: 'https://i.pravatar.cc/150?img=33', language: 'en' },
  { lineUserId: 'U003mock', displayName: 'Maria Garcia', pictureUrl: 'https://i.pravatar.cc/150?img=20', language: 'en' },
  { lineUserId: 'U004mock', displayName: 'James Wilson', pictureUrl: 'https://i.pravatar.cc/150?img=11', language: 'en' },
  { lineUserId: 'U005mock', displayName: 'Lisa Anderson', pictureUrl: 'https://i.pravatar.cc/150?img=45', language: 'en' },
  { lineUserId: 'U006mock', displayName: 'David Martinez', pictureUrl: 'https://i.pravatar.cc/150?img=14', language: 'en' },
  { lineUserId: 'U007mock', displayName: 'Susan Taylor', pictureUrl: 'https://i.pravatar.cc/150?img=47', language: 'en' },
  { lineUserId: 'U008mock', displayName: 'Michael Brown', pictureUrl: 'https://i.pravatar.cc/150?img=15', language: 'en' },
  { lineUserId: 'U009mock', displayName: 'Patricia Johnson', pictureUrl: 'https://i.pravatar.cc/150?img=23', language: 'en' },
  { lineUserId: 'U010mock', displayName: 'Christopher Davis', pictureUrl: 'https://i.pravatar.cc/150?img=52', language: 'en' },
  { lineUserId: 'U011mock', displayName: 'Amanda White', pictureUrl: 'https://i.pravatar.cc/150?img=24', language: 'en' },
  { lineUserId: 'U012mock', displayName: 'Daniel Harris', pictureUrl: 'https://i.pravatar.cc/150?img=60', language: 'en' },
  { lineUserId: 'U013mock', displayName: 'Michelle Clark', pictureUrl: 'https://i.pravatar.cc/150?img=32', language: 'en' },
  { lineUserId: 'U014mock', displayName: 'Ryan Lewis', pictureUrl: 'https://i.pravatar.cc/150?img=68', language: 'en' },
  { lineUserId: 'U015mock', displayName: 'Jessica Robinson', pictureUrl: 'https://i.pravatar.cc/150?img=44', language: 'en' },
];

/**
 * Generate bookings for the calendar
 */
function generateBookings(serviceIds, staffIds, customerIds) {
  const bookings = [];
  const now = new Date();

  // Generate bookings for November 2025 only
  const startDate = new Date(2025, 10, 1); // November 1, 2025 (month is 0-indexed)
  const endDate = new Date(2025, 10, 30); // November 30, 2025

  // Iterate through each day
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isPast = d < now;

    // Skip Sundays (staff not available)
    if (dayOfWeek === 0) continue;

    // Skip some random days to make it realistic
    if (Math.random() < 0.15) continue;

    // More bookings on weekends and mid-week
    const isWeekend = dayOfWeek === 6;
    const isMidWeek = dayOfWeek === 3 || dayOfWeek === 4;

    let bookingsPerDay = 3 + Math.floor(Math.random() * 4); // 3-6 bookings
    if (isWeekend) bookingsPerDay += 2;
    if (isMidWeek) bookingsPerDay += 1;

    // Generate bookings for this day
    const usedTimeSlots = new Set();

    for (let i = 0; i < bookingsPerDay; i++) {
      // Random time between 9am and 5pm
      let hour, minute, timeSlot;
      let attempts = 0;

      do {
        hour = 9 + Math.floor(Math.random() * 8); // 9am to 4pm
        minute = Math.random() < 0.5 ? 0 : 30; // On the hour or half hour
        timeSlot = `${hour}:${minute}`;
        attempts++;
      } while (usedTimeSlots.has(timeSlot) && attempts < 20);

      if (attempts >= 20) continue; // Skip if we can't find a slot

      usedTimeSlots.add(timeSlot);

      // Create booking datetime
      const bookingDate = new Date(d);
      bookingDate.setHours(hour, minute, 0, 0);

      // Random service, staff, and customer
      const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
      const staffId = staffIds[Math.floor(Math.random() * staffIds.length)];
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];

      // Get service duration (default 60 if not found)
      const serviceIndex = serviceIds.indexOf(serviceId);
      const duration = SERVICES[serviceIndex]?.duration || 60;

      // Determine status (all November 2025 bookings are future)
      let status;
      let noShow = false;
      let cancelledAt = null;
      let cancelledBy = null;
      let cancellationReason = null;

      // All bookings in November 2025 are future bookings
      const rand = Math.random();
      if (rand < 0.15) {
        status = 'pending';
      } else if (rand < 0.20) {
        status = 'cancelled';
        cancelledAt = new Date();
        cancelledBy = Math.random() < 0.7 ? 'customer' : 'owner';
        cancellationReason = 'Schedule conflict';
      } else {
        status = 'confirmed';
      }

      bookings.push({
        businessId: BUSINESS_ID,
        customerId,
        serviceId,
        staffId,
        dateTime: bookingDate,
        duration,
        status,
        responses: {},
        reminderSent: false, // Future bookings haven't been reminded yet
        confirmationSent: status !== 'pending',
        notes: '',
        noShow,
        cancelledAt,
        cancelledBy,
        cancellationReason,
      });
    }
  }

  return bookings;
}

async function main() {
  console.log('🌱 Starting calendar seed...\n');

  try {
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: BUSINESS_ID },
    });

    if (!business) {
      throw new Error(`Business with ID ${BUSINESS_ID} not found!`);
    }

    console.log(`✓ Found business: ${business.name}\n`);

    // Get or create services
    console.log('Getting services...');
    let createdServices = await prisma.service.findMany({
      where: { businessId: BUSINESS_ID },
    });

    if (createdServices.length === 0) {
      console.log('No services found, creating new ones...');
      for (const service of SERVICES) {
        const created = await prisma.service.create({
          data: {
            ...service,
            businessId: BUSINESS_ID,
          },
        });
        createdServices.push(created);
        console.log(`  ✓ Created ${created.name}`);
      }
    } else {
      console.log(`✓ Found ${createdServices.length} existing services`);
      createdServices.forEach(s => console.log(`  - ${s.name}`));
    }
    console.log();

    // Get or create staff
    console.log('Getting staff...');
    let createdStaff = await prisma.staff.findMany({
      where: { businessId: BUSINESS_ID },
    });

    if (createdStaff.length === 0) {
      console.log('No staff found, creating new ones...');
      for (const staff of STAFF) {
        const created = await prisma.staff.create({
          data: {
            ...staff,
            businessId: BUSINESS_ID,
          },
        });
        createdStaff.push(created);
        console.log(`  ✓ Created ${created.name}`);
      }
    } else {
      console.log(`✓ Found ${createdStaff.length} existing staff members`);
      createdStaff.forEach(s => console.log(`  - ${s.name}`));
    }
    console.log();

    // Get or create customers
    console.log('Getting customers...');
    const createdCustomers = [];
    for (const customer of CUSTOMERS) {
      let existing = await prisma.customer.findUnique({
        where: { lineUserId: customer.lineUserId },
      });

      if (!existing) {
        existing = await prisma.customer.create({
          data: customer,
        });
        console.log(`  ✓ Created ${existing.displayName}`);
      }
      createdCustomers.push(existing);
    }
    console.log(`✓ Using ${createdCustomers.length} customers\n`);

    // Generate and create bookings
    console.log('Generating bookings...');
    const serviceIds = createdServices.map(s => s.id);
    const staffIds = createdStaff.map(s => s.id);
    const customerIds = createdCustomers.map(c => c.id);

    const bookingsData = generateBookings(serviceIds, staffIds, customerIds);

    console.log(`Creating ${bookingsData.length} bookings...`);
    let createdCount = 0;
    for (const booking of bookingsData) {
      await prisma.booking.create({ data: booking });
      createdCount++;
      if (createdCount % 20 === 0) {
        console.log(`  Created ${createdCount}/${bookingsData.length} bookings...`);
      }
    }
    console.log(`✓ Created ${createdCount} bookings\n`);

    // Summary
    console.log('═══════════════════════════════════');
    console.log('✓ Calendar seed completed!');
    console.log('═══════════════════════════════════');
    console.log(`Services:  ${createdServices.length}`);
    console.log(`Staff:     ${createdStaff.length}`);
    console.log(`Customers: ${createdCustomers.length}`);
    console.log(`Bookings:  ${createdCount}`);
    console.log('═══════════════════════════════════\n');

    // Status breakdown
    const statusCounts = await prisma.booking.groupBy({
      by: ['status'],
      where: { businessId: BUSINESS_ID },
      _count: { status: true },
    });

    console.log('Booking Status Breakdown:');
    statusCounts.forEach(({ status, _count }) => {
      console.log(`  ${status}: ${_count.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
