import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard/[businessId]/settings
 * Get business settings for dashboard operations (authenticated endpoint)
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Get business with related data
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
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Verify ownership
    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('[Dashboard Settings API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
