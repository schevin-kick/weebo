import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateBusinessQRCode } from '@/lib/qrGenerator';

/**
 * GET /api/businesses
 * Get all businesses for authenticated owner
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businesses = await prisma.business.findMany({
      where: {
        ownerId: session.id,
        isActive: true,
      },
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

    return NextResponse.json({ businesses: businessesWithCounts });
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
          contactInfo: data.business.contactInfo,
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
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}
