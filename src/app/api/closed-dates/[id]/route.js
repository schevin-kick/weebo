/**
 * Closed Date API
 * DELETE /api/closed-dates/[id]
 */

import { NextResponse } from 'next/server';
import { getSession, canAccessBusiness } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch closed date with business
    const closedDate = await prisma.closedDate.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!closedDate) {
      return NextResponse.json({ error: 'Closed date not found' }, { status: 404 });
    }

    // Verify business ownership
    if (!canAccessBusiness(session, closedDate.businessId, closedDate.business.ownerId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete closed date
    await prisma.closedDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting closed date:', error);
    return NextResponse.json(
      { error: 'Failed to delete closed date' },
      { status: 500 }
    );
  }
}
