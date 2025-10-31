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

    // Build where clause
    const whereClause = {
      ownerId: session.id,
      isActive: true,
    };

    // Add search filter if query provided
    if (searchQuery && searchQuery.trim().length > 0) {
      whereClause.OR = [
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
          richMenu: data.business.richMenu,
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

    return NextResponse.json({ business }, { status: 201 });
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
