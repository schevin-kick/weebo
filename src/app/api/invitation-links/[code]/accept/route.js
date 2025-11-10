import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, createSession, setSessionCookie } from '@/lib/auth';

// POST /api/invitation-links/[code]/accept - Accept invitation and grant permission
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;

    // Find invitation link
    const invitationLink = await prisma.businessInvitationLink.findUnique({
      where: { code },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            ownerId: true,
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

    // Check if user is already the owner of this business
    if (invitationLink.business.ownerId === session.id) {
      return NextResponse.json(
        { error: 'You are already the owner of this business' },
        { status: 400 }
      );
    }

    // Validate invitation
    const now = new Date();
    if (!invitationLink.isActive) {
      return NextResponse.json(
        { error: 'This invitation has been deactivated' },
        { status: 400 }
      );
    }

    if (invitationLink.expiresAt < now) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    if (invitationLink.usedCount >= invitationLink.maxUses) {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 400 }
      );
    }

    // Check if user already has permission
    const existingPermission = await prisma.businessPermission.findUnique({
      where: {
        businessId_lineUserId: {
          businessId: invitationLink.businessId,
          lineUserId: session.lineUserId,
        },
      },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'You already have access to this business' },
        { status: 400 }
      );
    }

    // Create permission and update invitation link in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create permission
      const permission = await tx.businessPermission.create({
        data: {
          businessId: invitationLink.businessId,
          lineUserId: session.lineUserId,
          displayName: session.displayName,
          grantedById: invitationLink.createdById,
        },
      });

      // Update invitation link
      const updatedLink = await tx.businessInvitationLink.update({
        where: { id: invitationLink.id },
        data: {
          usedCount: { increment: 1 },
          isActive: invitationLink.usedCount + 1 >= invitationLink.maxUses ? false : true,
        },
      });

      return { permission, updatedLink };
    });

    // Refresh session to include new permission
    const updatedPermissions = await prisma.businessPermission.findMany({
      where: { lineUserId: session.lineUserId },
      select: { businessId: true },
    });
    const permittedBusinessIds = updatedPermissions.map(p => p.businessId);

    // Create new session with updated permissions
    const newSessionToken = await createSession({
      id: session.id,
      lineUserId: session.lineUserId,
      displayName: session.displayName,
      pictureUrl: session.pictureUrl,
      email: session.email,
    }, session.subscription, permittedBusinessIds);

    // Update session cookie
    await setSessionCookie(newSessionToken);

    return NextResponse.json({
      success: true,
      message: 'You now have access to this business',
      businessId: invitationLink.businessId,
      businessName: invitationLink.business.businessName,
      permission: {
        id: result.permission.id,
        createdAt: result.permission.createdAt,
      },
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
