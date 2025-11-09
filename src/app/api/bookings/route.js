import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendBookingConfirmation, sendBusinessOwnerNotification } from '@/lib/lineMessaging';
import { publicRateLimit, authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { detectLocaleFromRequest, translate } from '@/lib/localeUtils';
import { extractContactInfo } from '@/utils/contactExtractor';

/**
 * POST /api/bookings
 * Create a new booking (from LIFF app or authenticated user)
 */
export async function POST(request) {
  try {
    // Apply rate limiting (public endpoint - 10 req/min per IP)
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(publicRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

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
      locale: requestLocale,
    } = data;

    // Detect locale from request headers/cookies, fallback to request body locale
    const locale = detectLocaleFromRequest(request, requestLocale);

    // Validate required fields
    if (!businessId || !dateTime) {
      const errorMessage = await translate(locale, 'api.booking.errors.missingDateTime');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Get business with settings and owner subscription status
    const business = await prisma.business.findUnique({
      where: { id: businessId, isActive: true },
      include: {
        services: true,
        staff: true,
        closedDates: true,
        owner: {
          select: {
            id: true,
            subscriptionStatus: true,
            trialStartsAt: true,
            trialEndsAt: true,
          },
        },
      },
    });

    if (!business) {
      const errorMessage = await translate(locale, 'api.booking.errors.businessNotFound');
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // Check business owner's subscription status
    const { checkSubscriptionAccess } = await import('@/lib/subscriptionHelpers');
    const { hasAccess } = await checkSubscriptionAccess(business.ownerId);

    if (!hasAccess) {
      const { translate } = await import('@/lib/localeUtils');
      const errorMessage = await translate(locale, 'api.booking.subscriptionInactive');

      return NextResponse.json(
        {
          error: 'Booking unavailable',
          message: errorMessage
        },
        { status: 403 }
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
      const errorMessage = await translate(locale, 'api.booking.errors.outsideBusinessHours');
      return NextResponse.json(
        { error: errorMessage },
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
      const errorMessage = await translate(locale, 'api.booking.errors.businessClosed');
      return NextResponse.json(
        { error: errorMessage },
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
          const errorMessage = await translate(locale, 'api.booking.errors.staffUnavailable');
          return NextResponse.json(
            { error: errorMessage },
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
        const errorMessage = await translate(locale, 'api.booking.errors.alreadyBooked');
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    // Create or update customer
    let customer;
    if (customerLineUserId) {
      // LINE mode - use LINE user ID for identification
      customer = await prisma.customer.upsert({
        where: { lineUserId: customerLineUserId },
        update: {
          displayName: customerDisplayName,
          pictureUrl: customerPictureUrl,
          lastActiveAt: new Date(),
          language: locale, // Update language preference for future cron jobs
        },
        create: {
          lineUserId: customerLineUserId,
          displayName: customerDisplayName,
          pictureUrl: customerPictureUrl,
          language: locale, // Store language preference for future cron jobs
          customerType: 'line',
        },
      });
    } else {
      // Standalone mode - extract contact info from custom field responses
      const { email, phone, name } = await extractContactInfo(businessId, responses);

      if (email) {
        // Found email in custom fields - use it for customer identification
        customer = await prisma.customer.upsert({
          where: { email },
          update: {
            displayName: name || customerDisplayName || email.split('@')[0],
            phone: phone || undefined,
            lastActiveAt: new Date(),
            language: locale,
          },
          create: {
            email,
            displayName: name || customerDisplayName || email.split('@')[0],
            phone: phone || null,
            language: locale,
            customerType: 'web',
          },
        });
      } else {
        // No email found - create anonymous customer (booking still succeeds)
        customer = await prisma.customer.create({
          data: {
            displayName: name || customerDisplayName || 'Guest',
            phone: phone || null,
            language: locale,
            customerType: 'anonymous',
          },
        });
      }
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
        business: true,
        customer: true,
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

    // Send LINE confirmation message for confirmed bookings
    let messageResult = null;
    if (booking.status === 'confirmed') {
      try {
        messageResult = await sendBookingConfirmation(booking, business, locale);

        // Log message result
        if (messageResult && messageResult.status === 'sent') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { confirmationSent: true },
          });

          await prisma.bookingMessage.create({
            data: {
              bookingId: booking.id,
              messageType: 'confirmation',
              deliveryStatus: 'sent',
              messageContent: { status: 'sent' },
            },
          });

          console.log('[Booking API] Confirmation message sent successfully');
        } else {
          console.warn('[Booking API] Confirmation message not sent:', messageResult);
        }
      } catch (messageError) {
        console.error('[Booking API] Error sending confirmation message:', messageError);
        // Don't fail the request if message fails
      }
    }

    // Send notification to business owner
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      try {
        // Get business with owner info
        const businessWithOwner = await prisma.business.findUnique({
          where: { id: businessId },
          include: { owner: true },
        });

        if (businessWithOwner && businessWithOwner.notificationsEnabled !== false) {
          const ownerNotifResult = await sendBusinessOwnerNotification(booking, businessWithOwner, locale);

          if (ownerNotifResult && ownerNotifResult.status === 'sent') {
            console.log('[Booking API] Owner notification sent successfully');
          } else {
            console.warn('[Booking API] Owner notification not sent:', ownerNotifResult);
          }
        }
      } catch (notifError) {
        console.error('[Booking API] Owner notification failed:', notifError);
        // Don't fail the booking request if notification fails
      }
    }

    return NextResponse.json({
      booking,
      messageSent: messageResult?.status === 'sent',
    }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.booking.errors.failedToCreate');
    return NextResponse.json(
      { error: error.message || errorMessage },
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
    // Apply rate limiting
    const session = await getSession();
    const identifier = getIdentifier(request, session);
    const rateLimiter = session ? authenticatedRateLimit : publicRateLimit;
    const rateLimitResult = await checkRateLimit(rateLimiter, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const customerId = searchParams.get('customerId');
    const customerLineUserId = searchParams.get('customerLineUserId');
    const customerEmail = searchParams.get('customerEmail');

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Filter params
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Sort params
    const sortBy = searchParams.get('sortBy') || 'dateTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let whereClause = {};

    if (businessId) {
      // Business owner checking their bookings (requires auth)
      // Note: session already retrieved above for rate limiting
      if (!session) {
        const locale = detectLocaleFromRequest(request);
        const errorMessage = await translate(locale, 'api.errors.unauthorized');
        return NextResponse.json({ error: errorMessage }, { status: 401 });
      }

      // Verify business ownership
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business || business.ownerId !== session.id) {
        const locale = detectLocaleFromRequest(request);
        const errorMessage = await translate(locale, 'api.errors.forbidden');
        return NextResponse.json({ error: errorMessage }, { status: 403 });
      }

      whereClause.businessId = businessId;

      // Add date range filter
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      if (startDate && endDate) {
        whereClause.dateTime = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Add status filter
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      // Add search filter for real data
      if (search) {
        whereClause.customer = {
          displayName: {
            contains: search,
            mode: 'insensitive',
          },
        };
      }
    } else if (customerLineUserId) {
      // Customer checking their own bookings (LIFF)
      const customer = await prisma.customer.findUnique({
        where: { lineUserId: customerLineUserId },
      });

      if (!customer) {
        return NextResponse.json({ bookings: [], totalCount: 0 });
      }

      whereClause.customerId = customer.id;
    } else if (customerEmail) {
      // Customer checking their own bookings (standalone - by email)
      const customer = await prisma.customer.findUnique({
        where: { email: customerEmail },
      });

      if (!customer) {
        return NextResponse.json({ bookings: [], totalCount: 0 });
      }

      whereClause.customerId = customer.id;
    } else if (customerId) {
      whereClause.customerId = customerId;
    } else {
      const locale = detectLocaleFromRequest(request);
      const errorMessage = await translate(locale, 'api.booking.errors.missingParams');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Build orderBy clause for real data
    let orderBy = {};
    if (sortBy === 'dateTime') {
      orderBy.dateTime = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'customer') {
      orderBy.customer = {
        displayName: sortOrder,
      };
    } else {
      orderBy.dateTime = 'desc'; // default
    }

    // Get total count for pagination (real data)
    const totalCount = await prisma.booking.count({
      where: whereClause,
    });

    // Fetch bookings with pagination (real data)
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            businessName: true,
            logoUrl: true,
            address: true,
            phone: true,
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
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      bookings,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.booking.errors.failedToFetch');
    return NextResponse.json(
      { error: errorMessage },
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
