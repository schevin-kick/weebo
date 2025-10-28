/**
 * Top Customers API
 * GET /api/dashboard/[businessId]/top-customers
 * Returns top 10 customers by booking count
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get top customers by booking count
    const topCustomers = await prisma.booking.groupBy({
      by: ['customerId'],
      where: {
        businessId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Fetch customer details
    const customerIds = topCustomers.map((c) => c.customerId);
    const customers = await prisma.customer.findMany({
      where: {
        id: {
          in: customerIds,
        },
      },
      select: {
        id: true,
        displayName: true,
        pictureUrl: true,
      },
    });

    // Combine data
    const topCustomersWithDetails = topCustomers.map((tc) => {
      const customer = customers.find((c) => c.id === tc.customerId);
      return {
        customer,
        bookingCount: tc._count.id,
      };
    });

    return NextResponse.json({ topCustomers: topCustomersWithDetails });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top customers' },
      { status: 500 }
    );
  }
}
