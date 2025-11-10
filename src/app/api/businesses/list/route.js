import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/businesses/list
 * Lightweight endpoint for listing businesses with minimal data
 * Returns only essential fields for UI lists/navigation
 * Supports search via query params: ?q=searchTerm&limit=5
 */
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Add search filter if query provided (searches both name and address)
    if (searchQuery && searchQuery.trim().length > 0) {
      // Combine with existing OR clause for ownership/permissions
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

    // Get businesses with minimal fields only
    const businesses = await prisma.business.findMany({
      where: whereClause,
      select: {
        id: true,
        businessName: true,
        logoUrl: true,
        address: true,
        ownerId: true, // Include ownerId to determine if user is owner
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

    // Transform _count and add isOwner flag
    const businessesWithCounts = businesses.map((business) => ({
      ...business,
      isOwner: business.ownerId === session.id,
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
    console.error('Get businesses list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}
