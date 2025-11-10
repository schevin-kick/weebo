import { NextResponse } from 'next/server';
import { getSession, canAccessBusiness } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendBusinessOwnerNotification } from '@/lib/lineMessaging';
import { authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';

/**
 * POST /api/appointments
 * Create a new ad hoc appointment from the dashboard (business owner or authorized users)
 * This endpoint is separate from /api/bookings to maintain separation of concerns:
 * - /api/bookings: LINE LIFF app bookings with LINE customers
 * - /api/appointments: Dashboard-created appointments with ad hoc customers
 */
export async function POST(request) {
  try {
    // Require authentication
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    // Apply rate limiting (authenticated endpoint - 60 req/min per user)
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(authenticatedRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const data = await request.json();
    const {
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      staffId,
      dateTime,
      duration,
      notes,
    } = data;

    // Validate required fields
    if (!businessId || !dateTime || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, dateTime, and customerName are required' },
        { status: 400 }
      );
    }

    // Verify business belongs to authenticated user
    const business = await prisma.business.findUnique({
      where: { id: businessId, isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            lineUserId: true,
            subscriptionStatus: true,
          },
        },
        services: { where: { isActive: true } },
        staff: { where: { isActive: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found or inactive' }, { status: 404 });
    }

    // Check if user is owner or has been granted permissions
    if (!canAccessBusiness(session, businessId, business.owner.id)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this business' },
        { status: 403 }
      );
    }

    // Check subscription status
    if (business.owner.subscriptionStatus !== 'active' && business.owner.subscriptionStatus !== 'trialing') {
      return NextResponse.json(
        { error: 'Active subscription required to create appointments' },
        { status: 403 }
      );
    }

    // Parse dateTime (handles both ISO string and { date, time } object)
    let bookingDateTime;
    if (typeof dateTime === 'string') {
      bookingDateTime = new Date(dateTime);
    } else if (dateTime.date && dateTime.time) {
      bookingDateTime = new Date(`${dateTime.date}T${dateTime.time}:00`);
    } else {
      return NextResponse.json(
        { error: 'Invalid dateTime format. Expected ISO string or { date, time } object' },
        { status: 400 }
      );
    }

    if (isNaN(bookingDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 });
    }

    // Liberal booking policy: No validation for business hours, closed dates,
    // staff availability, or double-booking. Business owners have full control
    // to create appointments as needed, including conflicting appointments.

    // Create ad hoc customer (no LINE ID)
    const customer = await prisma.customer.create({
      data: {
        lineUserId: null,
        displayName: customerName,
        email: customerEmail || null,
        phone: customerPhone || null,
        customerType: 'adhoc',
        language: 'en', // Default language for ad hoc customers
      },
    });

    // Validate and get service for duration
    let validatedServiceId = null;
    let finalDuration = duration || business.defaultDuration;

    if (serviceId) {
      const service = business.services.find((s) => s.id === serviceId);
      if (service) {
        validatedServiceId = service.id;
        // Use service duration if no custom duration provided
        if (!duration && service.duration) {
          finalDuration = service.duration;
        }
      }
    }

    // Validate and get staff
    let validatedStaffId = null;
    if (staffId) {
      const staff = business.staff.find((s) => s.id === staffId);
      if (staff) {
        validatedStaffId = staff.id;
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
        duration: finalDuration,
        status: business.requiresApproval ? 'pending' : 'confirmed',
        responses: notes ? { notes } : {},
        reminderSent: false,
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        business: {
          include: {
            owner: true,
          },
        },
      },
    });

    // Send notification to business owner (LINE message if they have LINE ID)
    let ownerNotified = false;
    try {
      if (business.owner.lineUserId) {
        await sendBusinessOwnerNotification(booking, business);
        ownerNotified = true;
      }
    } catch (error) {
      console.error('[Appointments API] Failed to send owner notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      booking,
      ownerNotified,
      message: 'Appointment created successfully',
    });

  } catch (error) {
    console.error('[Appointments API] Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
