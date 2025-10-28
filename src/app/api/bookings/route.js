import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/bookings
 * Create a new booking (from LIFF app or authenticated user)
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      businessId,
      customerLineUserId,
      customerDisplayName,
      customerPictureUrl,
      serviceId,
      staffId,
      dateTime,
      duration,
      responses,
    } = data;

    // Validate required fields
    if (!businessId || !dateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get business with settings
    const business = await prisma.business.findUnique({
      where: { id: businessId, isActive: true },
      include: {
        services: { where: { id: serviceId || 'none' } },
        staff: { where: { id: staffId || 'none' } },
        closedDates: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const bookingDateTime = new Date(dateTime);

    // 1. Validate against business hours
    const isWithinHours = validateBusinessHours(
      bookingDateTime,
      business.businessHours
    );

    if (!isWithinHours && !business.appointmentOnly) {
      return NextResponse.json(
        { error: 'Selected time is outside business hours' },
        { status: 400 }
      );
    }

    // 2. Check if date is closed
    const dayStart = new Date(bookingDateTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingDateTime);
    dayEnd.setHours(23, 59, 59, 999);

    const closedDate = business.closedDates.find((cd) => {
      const closedDay = new Date(cd.date);
      return closedDay >= dayStart && closedDay <= dayEnd;
    });

    if (closedDate) {
      return NextResponse.json(
        { error: `Business is closed: ${closedDate.reason}` },
        { status: 400 }
      );
    }

    // 3. Validate staff availability (if staff selected)
    if (staffId && business.staff[0]) {
      const staff = business.staff[0];
      const isStaffAvailable = validateStaffAvailability(
        bookingDateTime,
        staff.availability
      );

      if (!isStaffAvailable) {
        return NextResponse.json(
          { error: 'Selected staff is not available at this time' },
          { status: 400 }
        );
      }
    }

    // 4. Check for double-booking (same staff, overlapping time)
    if (staffId) {
      const bookingDuration = duration || business.defaultDuration;
      const endTime = new Date(bookingDateTime.getTime() + bookingDuration * 60000);

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          staffId,
          status: { in: ['pending', 'confirmed'] },
          dateTime: {
            lt: endTime,
          },
          AND: {
            dateTime: {
              gte: bookingDateTime,
            },
          },
        },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          { error: 'This time slot is already booked' },
          { status: 400 }
        );
      }
    }

    // Create or update customer
    let customer;
    if (customerLineUserId) {
      customer = await prisma.customer.upsert({
        where: { lineUserId: customerLineUserId },
        update: {
          displayName: customerDisplayName,
          pictureUrl: customerPictureUrl,
          lastActiveAt: new Date(),
        },
        create: {
          lineUserId: customerLineUserId,
          displayName: customerDisplayName,
          pictureUrl: customerPictureUrl,
        },
      });
    } else {
      // For testing without LIFF, create anonymous customer
      customer = await prisma.customer.create({
        data: {
          lineUserId: `test_${Date.now()}`,
          displayName: customerDisplayName || 'Anonymous',
          pictureUrl: customerPictureUrl || null,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        customerId: customer.id,
        serviceId: serviceId || null,
        staffId: staffId || null,
        dateTime: bookingDateTime,
        duration: duration || business.defaultDuration,
        status: business.requiresApproval ? 'pending' : 'confirmed',
        responses: responses || {},
        reminderSent: false,
        confirmationSent: false,
      },
      include: {
        business: {
          select: {
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    // TODO: Send LINE confirmation message if not appointment-only

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * Get bookings (filtered by query params)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const customerId = searchParams.get('customerId');
    const customerLineUserId = searchParams.get('customerLineUserId');

    let whereClause = {};

    if (businessId) {
      // Business owner checking their bookings (requires auth)
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify business ownership
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business || business.ownerId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      whereClause.businessId = businessId;
    } else if (customerLineUserId) {
      // Customer checking their own bookings (LIFF)
      const customer = await prisma.customer.findUnique({
        where: { lineUserId: customerLineUserId },
      });

      if (!customer) {
        return NextResponse.json({ bookings: [] });
      }

      whereClause.customerId = customer.id;
    } else if (customerId) {
      whereClause.customerId = customerId;
    } else {
      return NextResponse.json(
        { error: 'Missing query parameters' },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Helper functions

function validateBusinessHours(dateTime, businessHours) {
  if (businessHours.mode === '24/7') {
    return true;
  }

  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dateTime.getDay()];
  const time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`;

  if (businessHours.mode === 'same-daily') {
    const { open, close } = businessHours.sameDaily;
    return time >= open && time < close;
  }

  if (businessHours.mode === 'custom') {
    const dayConfig = businessHours.custom[dayOfWeek];
    if (dayConfig.closed) return false;
    return time >= dayConfig.open && time < dayConfig.close;
  }

  return false;
}

function validateStaffAvailability(dateTime, availability) {
  if (availability.useBusinessHours !== false) {
    return true; // Already validated against business hours
  }

  if (!availability.custom) return false;

  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dateTime.getDay()];
  const time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`;

  const dayConfig = availability.custom[dayOfWeek];
  if (!dayConfig || dayConfig.closed) return false;

  return time >= dayConfig.open && time < dayConfig.close;
}
