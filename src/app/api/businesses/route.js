import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateBusinessQRCode } from '@/lib/qrGenerator';
import { authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * GET /api/businesses
 * Get all businesses for authenticated owner
 * Supports search via query params: ?q=searchTerm&limit=5
 */
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = getIdentifier(request, session);
    const rateLimitResult = await checkRateLimit(authenticatedRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;

    // Build where clause - include both owned businesses AND businesses user has permissions to
    const whereClause = {
      OR: [
        { ownerId: session.id },
        { id: { in: session.permittedBusinessIds || [] } },
      ],
      isActive: true,
    };

    // Add search filter if query provided
    if (searchQuery && searchQuery.trim().length > 0) {
      whereClause.AND = [
        {
          OR: [
            {
              businessName: {
                contains: searchQuery.trim(),
                mode: 'insensitive',
              },
            },
            {
              address: {
                contains: searchQuery.trim(),
                mode: 'insensitive',
              },
            },
          ],
        },
      ];
    }

    // Get total count (for pagination info)
    const totalCount = await prisma.business.count({
      where: whereClause,
    });

    // Get businesses with optional limit
    const businesses = await prisma.business.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            services: { where: { isActive: true } },
            staff: { where: { isActive: true } },
            bookings: { where: { status: 'pending' } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform _count for easier access
    const businessesWithCounts = businesses.map((business) => ({
      ...business,
      _count: {
        services: business._count.services,
        staff: business._count.staff,
        pendingBookings: business._count.bookings,
      },
    }));

    return NextResponse.json({
      businesses: businessesWithCounts,
      total: totalCount,
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/businesses
 * Create a new business with services, staff, and pages
 */
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = getIdentifier(request, session);
    const rateLimitResult = await checkRateLimit(authenticatedRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Check if this is the first business (allow creation to start trial)
    // For 2nd+ businesses, require active subscription
    const existingBusinessCount = await prisma.business.count({
      where: { ownerId: session.id },
    });

    if (existingBusinessCount > 0) {
      // Not first business - check subscription
      const { requireSubscription } = await import('@/middleware/subscriptionCheck');
      const subscriptionCheck = await requireSubscription(request);
      if (subscriptionCheck) {
        return subscriptionCheck; // Returns 403 if no subscription access
      }
    }
    // First business is always allowed (will start trial after creation)

    // Generate unique business ID
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const lineDeepLink = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?business_id=${businessId}`;

    // Create business with related data in transaction
    const business = await prisma.$transaction(async (tx) => {
      // Create business
      const newBusiness = await tx.business.create({
        data: {
          id: businessId,
          ownerId: session.id,
          businessName: data.business.businessName,
          logoUrl: data.business.logoUrl || null,
          businessHours: data.business.businessHours,
          defaultDuration: data.business.defaultDuration,
          appointmentOnly: data.business.appointmentOnly || false,
          requiresApproval: data.business.requiresApproval || false,
          phone: data.business.phone || null,
          email: data.business.email || null,
          address: data.business.address,
          website: data.business.website || null,
          lineDeepLink,
          isActive: true,
        },
      });

      // Create services
      if (data.services && data.services.length > 0) {
        await tx.service.createMany({
          data: data.services.map((service) => ({
            ...service,
            businessId,
          })),
        });
      }

      // Create staff
      if (data.staff && data.staff.length > 0) {
        await tx.staff.createMany({
          data: data.staff.map((member) => ({
            ...member,
            businessId,
          })),
        });
      }

      // Create pages
      if (data.pages && data.pages.length > 0) {
        await tx.page.createMany({
          data: data.pages.map((page) => ({
            ...page,
            businessId,
          })),
        });
      }

      return newBusiness;
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    });

    // Generate QR code asynchronously (don't block response)
    if (process.env.NEXT_PUBLIC_LIFF_ID) {
      generateBusinessQRCode(businessId, process.env.NEXT_PUBLIC_LIFF_ID)
        .then(({ qrCodeUrl, lineDeepLink }) => {
          return prisma.business.update({
            where: { id: businessId },
            data: { qrCodeUrl, lineDeepLink },
          });
        })
        .catch((error) => {
          console.error('QR code generation failed:', error);
          // Don't fail the request, QR can be generated later
        });
    }

    // Check if this is the user's first business - start trial if so
    const businessCount = await prisma.business.count({
      where: { ownerId: session.id },
    });

    const isFirstBusiness = businessCount === 1;
    let newCsrfToken = null;

    if (isFirstBusiness) {
      // First business! Start 14-day trial
      const { startTrial, calculateAccess } = await import('@/lib/subscriptionHelpers');
      const updatedOwner = await startTrial(session.id).catch((error) => {
        console.error('Failed to start trial:', error);
        // Don't fail the request - trial can be started manually if needed
        return null;
      });

      // Update session cookie with new subscription data to invalidate session cache
      if (updatedOwner) {
        const { createSession, setSessionCookie } = await import('@/lib/auth');
        const subscriptionData = calculateAccess(updatedOwner);

        // Fetch user's existing permissions to preserve them in the new session
        const permissions = await prisma.businessPermission.findMany({
          where: { lineUserId: session.lineUserId },
          select: { businessId: true },
        });
        const permittedBusinessIds = permissions.map(p => p.businessId);

        const newSessionToken = await createSession({
          id: session.id,
          lineUserId: session.lineUserId,
          displayName: session.displayName,
          pictureUrl: session.pictureUrl,
          email: session.email,
        }, subscriptionData, permittedBusinessIds);
        newCsrfToken = await setSessionCookie(newSessionToken);
        console.log(`[Subscription] Updated session cookie with trial data for user ${session.id}, preserving ${permittedBusinessIds.length} permitted businesses`);
      }
    }

    const response = { business, isFirstBusiness };
    if (newCsrfToken) {
      response.newCsrfToken = newCsrfToken;
      console.log(`[Business] Returning new CSRF token to client for user ${session.id}`);
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create business error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create business', details: error.message },
      { status: 500 }
    );
  }
}
