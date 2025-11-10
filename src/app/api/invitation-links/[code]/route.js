import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invitation-links/[code] - Get invitation link details (public, no auth required)
export async function GET(request, { params }) {
  try {
    const { code } = await params;

    const invitationLink = await prisma.businessInvitationLink.findUnique({
      where: { code },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        createdBy: {
          select: {
            displayName: true,
          },
        },
      },
    });

    if (!invitationLink) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation is still valid
    const now = new Date();
    const isExpired = invitationLink.expiresAt < now;
    const isUsedUp = invitationLink.usedCount >= invitationLink.maxUses;
    const isValid = invitationLink.isActive && !isExpired && !isUsedUp;

    return NextResponse.json({
      id: invitationLink.id,
      code: invitationLink.code,
      business: {
        id: invitationLink.business.id,
        name: invitationLink.business.businessName,
        logoUrl: invitationLink.business.logoUrl,
      },
      invitedBy: invitationLink.createdBy.displayName,
      expiresAt: invitationLink.expiresAt,
      isValid,
      isExpired,
      isUsedUp,
      isActive: invitationLink.isActive,
    });
  } catch (error) {
    console.error('Error fetching invitation link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    );
  }
}
