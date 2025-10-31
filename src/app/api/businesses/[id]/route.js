import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateBusinessQRCode } from '@/lib/qrGenerator';

/**
 * GET /api/businesses/[id]
 * Get business details (public endpoint for LIFF, or authenticated for owner)
 */
export async function GET(request, { params }) {
  try {
    const { id: businessId } = await params;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        staff: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        pages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if authenticated user owns this business
    const session = await getSession();
    const isOwner = session && session.id === business.ownerId;

    // Return full data for owner, limited data for public
    if (isOwner) {
      return NextResponse.json({ business, isOwner: true });
    } else {
      // Public view - hide sensitive data
      const publicBusiness = {
        id: business.id,
        businessName: business.businessName,
        logoUrl: business.logoUrl,
        businessHours: business.businessHours,
        defaultDuration: business.defaultDuration,
        appointmentOnly: business.appointmentOnly,
        requiresApproval: business.requiresApproval,
        phone: business.phone,
        email: business.email,
        address: business.address,
        website: business.website,
        lineBotBasicId: business.lineBotBasicId,
        services: business.services,
        staff: business.staff,
        pages: business.pages,
      };
      return NextResponse.json({ business: publicBusiness, isOwner: false });
    }
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/businesses/[id]
 * Update business configuration (authenticated owners only)
 */
export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;
    const data = await request.json();

    // Verify ownership
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (existing.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update business in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update business
      const business = await tx.business.update({
        where: { id: businessId },
        data: {
          businessName: data.business.businessName,
          logoUrl: data.business.logoUrl,
          businessHours: data.business.businessHours,
          defaultDuration: data.business.defaultDuration,
          appointmentOnly: data.business.appointmentOnly,
          requiresApproval: data.business.requiresApproval,
          richMenu: data.business.richMenu,
          phone: data.business.phone,
          email: data.business.email,
          address: data.business.address,
          website: data.business.website,
        },
      });

      // Delete existing services and create new ones
      await tx.service.deleteMany({ where: { businessId } });
      if (data.services && data.services.length > 0) {
        await tx.service.createMany({
          data: data.services.map((service) => ({
            ...service,
            businessId,
          })),
        });
      }

      // Delete existing staff and create new ones
      await tx.staff.deleteMany({ where: { businessId } });
      if (data.staff && data.staff.length > 0) {
        await tx.staff.createMany({
          data: data.staff.map((member) => ({
            ...member,
            businessId,
          })),
        });
      }

      // Delete existing pages and create new ones
      await tx.page.deleteMany({ where: { businessId } });
      if (data.pages && data.pages.length > 0) {
        await tx.page.createMany({
          data: data.pages.map((page) => ({
            ...page,
            businessId,
          })),
        });
      }

      return business;
    });

    // Generate/update QR code if LIFF ID is configured
    if (process.env.NEXT_PUBLIC_LIFF_ID && !result.qrCodeUrl) {
      try {
        const { qrCodeUrl, lineDeepLink } = await generateBusinessQRCode(
          businessId,
          process.env.NEXT_PUBLIC_LIFF_ID
        );

        await prisma.business.update({
          where: { id: businessId },
          data: { qrCodeUrl, lineDeepLink },
        });

        result.qrCodeUrl = qrCodeUrl;
        result.lineDeepLink = lineDeepLink;
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        // Don't fail the entire request if QR code fails
      }
    }

    return NextResponse.json({ business: result });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/businesses/[id]
 * Soft delete business (set isActive to false)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;

    // Verify ownership
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (existing.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await prisma.business.update({
      where: { id: businessId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}
