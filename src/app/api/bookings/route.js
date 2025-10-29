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
        services: true,
        staff: true,
        closedDates: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Parse dateTime - it comes as { date: "YYYY-MM-DD", time: "HH:MM" }
    let bookingDateTime;
    if (typeof dateTime === 'object' && dateTime.date && dateTime.time) {
      // Combine date and time strings into a proper Date object
      const dateTimeString = `${dateTime.date}T${dateTime.time}:00`;
      bookingDateTime = new Date(dateTimeString);
    } else {
      // Fallback for other formats
      bookingDateTime = new Date(dateTime);
    }

    console.log('[Booking API] Parsed dateTime:', {
      input: dateTime,
      parsed: bookingDateTime.toISOString(),
      localTime: `${bookingDateTime.getHours()}:${String(bookingDateTime.getMinutes()).padStart(2, '0')}`,
    });

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
    const closedDate = business.closedDates.find((cd) => {
      const closedStart = new Date(cd.startDateTime);
      const closedEnd = new Date(cd.endDateTime);
      return bookingDateTime >= closedStart && bookingDateTime <= closedEnd;
    });

    if (closedDate) {
      return NextResponse.json(
        { error: 'Business is closed during the selected time' },
        { status: 400 }
      );
    }

    // 3. Validate staff availability (if staff selected)
    if (staffId) {
      const staff = business.staff.find(s => s.id === staffId);
      if (staff) {
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

    // Validate and sanitize serviceId if provided (gracefully handle deleted/invalid services)
    let validatedServiceId = null;
    if (serviceId) {
      const serviceExists = business.services.find(s => s.id === serviceId);
      if (serviceExists) {
        validatedServiceId = serviceId;
      } else {
        console.warn(`[Booking API] Service ${serviceId} not found, proceeding without service`);
      }
    }

    // Validate and sanitize staffId if provided (gracefully handle deleted/invalid staff)
    let validatedStaffId = null;
    if (staffId) {
      const staffExists = business.staff.find(s => s.id === staffId);
      if (staffExists) {
        validatedStaffId = staffId;
      } else {
        console.warn(`[Booking API] Staff ${staffId} not found, proceeding without staff`);
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        customerId: customer.id,
        serviceId: validatedServiceId,
        staffId: validatedStaffId,
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
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
            pages: {
              select: {
                components: true,
              },
            },
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
        customer: {
          select: {
            displayName: true,
            pictureUrl: true,
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

  // Use local time methods to avoid timezone issues
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dateTime.getDay()];
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  console.log('[validateBusinessHours]', {
    dateTime: dateTime.toISOString(),
    localTime: time,
    dayOfWeek,
    businessHours,
  });

  if (businessHours.mode === 'same-daily') {
    const { open, close } = businessHours.sameDaily;
    const isValid = time >= open && time < close;
    console.log('[validateBusinessHours] same-daily check:', { time, open, close, isValid });
    return isValid;
  }

  if (businessHours.mode === 'custom') {
    const dayConfig = businessHours.custom[dayOfWeek];
    if (dayConfig.closed) {
      console.log('[validateBusinessHours] Day is closed');
      return false;
    }
    const isValid = time >= dayConfig.open && time < dayConfig.close;
    console.log('[validateBusinessHours] custom check:', { time, open: dayConfig.open, close: dayConfig.close, isValid });
    return isValid;
  }

  console.log('[validateBusinessHours] No matching mode, returning false');
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
