/**
 * Notifications Settings API
 * PATCH /api/dashboard/[businessId]/notifications
 * Update notification settings for a business
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { authenticatedRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';

export async function PATCH(request, { params }) {
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

    const { businessId } = await params;
    const body = await request.json();
    const { notificationsEnabled } = body;

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update notification settings
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        notificationsEnabled: notificationsEnabled ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      business: {
        id: updatedBusiness.id,
        notificationsEnabled: updatedBusiness.notificationsEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}
