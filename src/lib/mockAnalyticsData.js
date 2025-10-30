/**
 * Mock Analytics Data Generator
 * Generates realistic analytics data for demonstration purposes
 * TODO: Remove this file when real data is available
 */

// Mock services and staff data
const MOCK_SERVICES = [
  { id: 'svc_1', name: 'Haircut & Styling', price: 65, duration: 45 },
  { id: 'svc_2', name: 'Hair Coloring', price: 120, duration: 90 },
  { id: 'svc_3', name: 'Massage Therapy', price: 90, duration: 60 },
  { id: 'svc_4', name: 'Facial Treatment', price: 75, duration: 50 },
  { id: 'svc_5', name: 'Manicure & Pedicure', price: 55, duration: 40 },
];

const MOCK_STAFF = [
  { id: 'staff_1', name: 'Sarah Chen', photoUrl: 'https://i.pravatar.cc/150?img=5' },
  { id: 'staff_2', name: 'Michael Torres', photoUrl: 'https://i.pravatar.cc/150?img=12' },
  { id: 'staff_3', name: 'Emma Rodriguez', photoUrl: 'https://i.pravatar.cc/150?img=9' },
  { id: 'staff_4', name: 'David Kim', photoUrl: 'https://i.pravatar.cc/150?img=13' },
];

const MOCK_CUSTOMERS = [
  { id: 'cust_1', displayName: 'Jennifer Lee', pictureUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'cust_2', displayName: 'Robert Smith', pictureUrl: 'https://i.pravatar.cc/150?img=33' },
  { id: 'cust_3', displayName: 'Maria Garcia', pictureUrl: 'https://i.pravatar.cc/150?img=20' },
  { id: 'cust_4', displayName: 'James Wilson', pictureUrl: 'https://i.pravatar.cc/150?img=11' },
  { id: 'cust_5', displayName: 'Lisa Anderson', pictureUrl: 'https://i.pravatar.cc/150?img=45' },
  { id: 'cust_6', displayName: 'David Martinez', pictureUrl: 'https://i.pravatar.cc/150?img=14' },
  { id: 'cust_7', displayName: 'Susan Taylor', pictureUrl: 'https://i.pravatar.cc/150?img=47' },
  { id: 'cust_8', displayName: 'Michael Brown', pictureUrl: 'https://i.pravatar.cc/150?img=15' },
  { id: 'cust_9', displayName: 'Patricia Johnson', pictureUrl: 'https://i.pravatar.cc/150?img=23' },
  { id: 'cust_10', displayName: 'Christopher Davis', pictureUrl: 'https://i.pravatar.cc/150?img=52' },
];

/**
 * Generate overview statistics
 */
export function generateMockOverview(startDate, endDate) {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

  // Generate realistic numbers based on a successful salon/spa business
  const totalBookings = Math.floor(120 + (days / 30) * 80); // ~100 bookings per month
  const completed = Math.floor(totalBookings * 0.72); // 72% completion rate
  const pending = Math.floor(totalBookings * 0.15); // 15% pending
  const confirmed = Math.floor(totalBookings * 0.08); // 8% confirmed
  const cancelled = totalBookings - completed - pending - confirmed;

  return {
    totalBookings,
    totalRevenue: completed * 85, // Average $85 per completed booking
    uniqueCustomers: Math.floor(totalBookings * 0.65), // 65% are unique (35% repeat)
    avgBookingValue: 85,
    statusDistribution: {
      pending,
      confirmed,
      completed,
      cancelled,
    },
    noShowCount: Math.floor(totalBookings * 0.05), // 5% no-show rate
    noShowRate: 5,
    conversionRate: 72,
    cancellationRate: Math.round((cancelled / totalBookings) * 100 * 10) / 10,
    cancellationBreakdown: {
      byOwner: Math.floor(cancelled * 0.3),
      byCustomer: Math.floor(cancelled * 0.7),
    },
  };
}

/**
 * Generate bookings trend data
 */
export function generateMockTrendData(startDate, endDate, groupBy = 'day') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];

  let current = new Date(start);
  let index = 0;

  while (current <= end) {
    let dateKey;

    if (groupBy === 'day') {
      dateKey = current.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(current);
      weekStart.setDate(current.getDate() - current.getDay());
      dateKey = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    }

    // Generate realistic booking patterns
    // Weekend and mid-week are busiest for salons/spas
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMidWeek = dayOfWeek === 3 || dayOfWeek === 4;

    let baseBookings = groupBy === 'day' ? 4 : groupBy === 'week' ? 25 : 100;

    // Add variation
    if (groupBy === 'day') {
      if (isWeekend) baseBookings += 3;
      if (isMidWeek) baseBookings += 2;
    }

    // Add growth trend (5% growth over time)
    const growthFactor = 1 + (index * 0.002);
    baseBookings = Math.floor(baseBookings * growthFactor);

    // Add some randomness
    const variation = Math.random() * 0.3 - 0.15; // ±15%
    const total = Math.max(1, Math.floor(baseBookings * (1 + variation)));

    data.push({
      date: dateKey,
      total,
      pending: Math.floor(total * 0.15),
      confirmed: Math.floor(total * 0.08),
      completed: Math.floor(total * 0.72),
      cancelled: Math.floor(total * 0.05),
      revenue: Math.floor(total * 0.72 * 85), // Completed * avg price
    });

    // Increment date based on groupBy
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'week') {
      current.setDate(current.getDate() + 7);
    } else if (groupBy === 'month') {
      current.setMonth(current.getMonth() + 1);
    }

    index++;
  }

  return data;
}

/**
 * Generate revenue analytics
 */
export function generateMockRevenueData() {
  const services = [
    { name: 'Haircut & Styling', basePrice: 65, popularity: 0.3 },
    { name: 'Hair Coloring', basePrice: 120, popularity: 0.25 },
    { name: 'Massage Therapy', basePrice: 90, popularity: 0.2 },
    { name: 'Facial Treatment', basePrice: 75, popularity: 0.15 },
    { name: 'Manicure & Pedicure', basePrice: 55, popularity: 0.1 },
  ];

  const staff = [
    { name: 'Sarah Chen', efficiency: 1.2 },
    { name: 'Michael Torres', efficiency: 1.1 },
    { name: 'Emma Rodriguez', efficiency: 1.0 },
    { name: 'David Kim', efficiency: 0.95 },
  ];

  const totalBookings = 120;

  // Revenue by service
  const revenueByService = services.map((service, idx) => {
    const bookings = Math.floor(totalBookings * service.popularity);
    const completedBookings = Math.floor(bookings * 0.72);
    return {
      serviceId: `service-${idx}`,
      serviceName: service.name,
      revenue: completedBookings * service.basePrice,
      bookingCount: completedBookings,
    };
  });

  // Revenue by staff
  const revenueByStaff = staff.map((member, idx) => {
    const bookings = Math.floor((totalBookings / staff.length) * member.efficiency);
    const completedBookings = Math.floor(bookings * 0.72);
    return {
      staffId: `staff-${idx}`,
      staffName: member.name,
      revenue: completedBookings * 85, // Average price
      bookingCount: completedBookings,
    };
  });

  const totalRevenue = revenueByService.reduce((sum, s) => sum + s.revenue, 0);
  const completedBookings = revenueByService.reduce((sum, s) => sum + s.bookingCount, 0);

  return {
    totalRevenue,
    completedBookings,
    revenueChange: 12.5, // 12.5% growth
    revenueByService: revenueByService.sort((a, b) => b.revenue - a.revenue),
    revenueByStaff: revenueByStaff.sort((a, b) => b.revenue - a.revenue),
  };
}

/**
 * Generate service performance data
 */
export function generateMockServicePerformance() {
  const services = [
    { name: 'Haircut & Styling', price: 65, duration: 45, popularity: 0.3, quality: 0.85 },
    { name: 'Hair Coloring', price: 120, duration: 90, popularity: 0.25, quality: 0.78 },
    { name: 'Massage Therapy', price: 90, duration: 60, popularity: 0.2, quality: 0.92 },
    { name: 'Facial Treatment', price: 75, duration: 50, popularity: 0.15, quality: 0.88 },
    { name: 'Manicure & Pedicure', price: 55, duration: 40, popularity: 0.1, quality: 0.90 },
  ];

  const totalBookings = 120;

  return services.map((service, idx) => {
    const bookings = Math.floor(totalBookings * service.popularity);
    const completedBookings = Math.floor(bookings * service.quality);
    const cancelledBookings = Math.floor(bookings * 0.08);

    return {
      serviceId: `service-${idx}`,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      totalBookings: bookings,
      completedBookings,
      cancelledBookings,
      completionRate: Math.round(service.quality * 100 * 10) / 10,
      cancellationRate: 8,
      revenue: completedBookings * service.price,
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);
}

/**
 * Generate staff performance data
 */
export function generateMockStaffPerformance() {
  const staff = [
    { name: 'Sarah Chen', photoUrl: 'https://i.pravatar.cc/150?img=5', efficiency: 1.2, quality: 0.95 },
    { name: 'Michael Torres', photoUrl: 'https://i.pravatar.cc/150?img=12', efficiency: 1.1, quality: 0.88 },
    { name: 'Emma Rodriguez', photoUrl: 'https://i.pravatar.cc/150?img=9', efficiency: 1.0, quality: 0.92 },
    { name: 'David Kim', photoUrl: 'https://i.pravatar.cc/150?img=13', efficiency: 0.95, quality: 0.85 },
  ];

  const avgBookingsPerStaff = 30;

  return staff.map((member, idx) => {
    const totalBookings = Math.floor(avgBookingsPerStaff * member.efficiency);
    const completedBookings = Math.floor(totalBookings * 0.72);
    const cancelledBookings = Math.floor(totalBookings * 0.08);
    const noShowBookings = Math.floor(totalBookings * (1 - member.quality) * 0.5);

    return {
      staffId: `staff-${idx}`,
      staffName: member.name,
      photoUrl: member.photoUrl,
      totalBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      completionRate: 72,
      cancellationRate: 8,
      noShowRate: Math.round((noShowBookings / totalBookings) * 100 * 10) / 10,
      revenue: completedBookings * 85, // Average price
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);
}

/**
 * Generate mock calendar bookings for several months
 * Creates realistic booking patterns across past and future months
 */
export function generateMockCalendarBookings(businessId) {
  const bookings = [];
  const now = new Date();

  // Generate bookings for 2 months in the past and 2 months in the future
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0); // Last day of 2 months ahead

  let bookingId = 1000;

  // Iterate through each day
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isPast = d < now;

    // Skip some random days to make it realistic
    if (Math.random() < 0.15) continue;

    // Business hours: 9am to 6pm
    // More bookings on weekends and mid-week
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMidWeek = dayOfWeek === 3 || dayOfWeek === 4;

    let bookingsPerDay = 3 + Math.floor(Math.random() * 4); // 3-6 bookings
    if (isWeekend) bookingsPerDay += 2;
    if (isMidWeek) bookingsPerDay += 1;

    // Generate bookings for this day
    const usedTimeSlots = new Set();

    for (let i = 0; i < bookingsPerDay; i++) {
      // Random time between 9am and 6pm
      let hour, minute, timeSlot;
      let attempts = 0;

      do {
        hour = 9 + Math.floor(Math.random() * 9); // 9am to 5pm
        minute = Math.random() < 0.5 ? 0 : 30; // On the hour or half hour
        timeSlot = `${hour}:${minute}`;
        attempts++;
      } while (usedTimeSlots.has(timeSlot) && attempts < 20);

      if (attempts >= 20) continue; // Skip if we can't find a slot

      usedTimeSlots.add(timeSlot);

      // Create booking datetime
      const bookingDate = new Date(d);
      bookingDate.setHours(hour, minute, 0, 0);

      // Random service and staff
      const service = MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)];
      const staff = MOCK_STAFF[Math.floor(Math.random() * MOCK_STAFF.length)];
      const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];

      // Determine status based on whether it's in the past or future
      let status;
      let noShow = false;
      let cancelledAt = null;
      let cancelledBy = null;

      if (isPast) {
        // Past bookings
        const rand = Math.random();
        if (rand < 0.72) {
          status = 'completed';
        } else if (rand < 0.77) {
          status = 'cancelled';
          cancelledAt = new Date(bookingDate);
          cancelledAt.setDate(cancelledAt.getDate() - Math.floor(Math.random() * 3));
          cancelledBy = Math.random() < 0.7 ? 'customer' : 'owner';
        } else if (rand < 0.80) {
          status = 'completed';
          noShow = true;
        } else {
          status = 'confirmed';
        }
      } else {
        // Future bookings
        const rand = Math.random();
        if (rand < 0.15) {
          status = 'pending';
        } else if (rand < 0.20) {
          status = 'cancelled';
          cancelledAt = new Date();
          cancelledBy = Math.random() < 0.7 ? 'customer' : 'owner';
        } else {
          status = 'confirmed';
        }
      }

      bookings.push({
        id: `mock_booking_${bookingId++}`,
        businessId,
        customerId: customer.id,
        customer: {
          displayName: customer.displayName,
          pictureUrl: customer.pictureUrl,
        },
        serviceId: service.id,
        service: {
          name: service.name,
          duration: service.duration,
          price: service.price,
        },
        staffId: staff.id,
        staff: {
          name: staff.name,
          photoUrl: staff.photoUrl,
        },
        dateTime: bookingDate.toISOString(),
        duration: service.duration,
        status,
        responses: {},
        reminderSent: isPast,
        confirmationSent: status !== 'pending',
        notes: '',
        noShow,
        cancelledAt: cancelledAt ? cancelledAt.toISOString() : null,
        cancelledBy,
        cancellationReason: cancelledAt ? 'Schedule conflict' : null,
        createdAt: new Date(bookingDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(bookingDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Sort by date
  return bookings.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
}
