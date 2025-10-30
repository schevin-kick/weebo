/**
 * Mock Analytics Data Generator
 * Generates realistic analytics data for demonstration purposes
 * TODO: Remove this file when real data is available
 */

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
