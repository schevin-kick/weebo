/**
 * Business Authorization Middleware
 * Reusable authorization helpers for business-scoped API routes
 */

import { NextResponse } from 'next/server';
import { getSession, canAccessBusiness } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Verify that the user has access to a business (owner or has permission)
 * @param {string} businessId - Business ID to check access for
 * @param {boolean} ownerOnly - If true, only allow business owner (default: false)
 * @returns {Promise<{session: object, business: object} | NextResponse>} Session and business if authorized, error response otherwise
 */
export async function verifyBusinessAccess(businessId, ownerOnly = false) {
  // Get session
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch business
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      ownerId: true,
      businessName: true,
      isActive: true,
    },
  });

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  if (!business.isActive) {
    return NextResponse.json({ error: 'Business is inactive' }, { status: 410 });
  }

  // Check authorization
  const isOwner = business.ownerId === session.id;

  if (ownerOnly) {
    // Owner-only operations (delete, billing, permissions management)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden - Only business owner can perform this action' },
        { status: 403 }
      );
    }
  } else {
    // Allow both owner and users with permissions
    if (!canAccessBusiness(session, businessId, business.ownerId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this business' },
        { status: 403 }
      );
    }
  }

  return { session, business, isOwner };
}
