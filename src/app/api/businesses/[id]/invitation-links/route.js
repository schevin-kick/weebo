import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Generate a random 6-character alphanumeric code
function generateInvitationCode() {
  return nanoid(6);
}

// POST /api/businesses/[id]/invitation-links - Create new invitation link
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;

    // Verify user owns this business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateInvitationCode();
      const existing = await prisma.businessInvitationLink.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation link
    const invitationLink = await prisma.businessInvitationLink.create({
      data: {
        businessId,
        code,
        maxUses: 1, // Single-use only
        expiresAt,
        createdById: session.id,
      },
      include: {
        business: {
          select: {
            businessName: true,
          },
        },
        createdBy: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: invitationLink.id,
      code: invitationLink.code,
      expiresAt: invitationLink.expiresAt,
      maxUses: invitationLink.maxUses,
      usedCount: invitationLink.usedCount,
      isActive: invitationLink.isActive,
      businessName: invitationLink.business.businessName,
      createdBy: invitationLink.createdBy.displayName,
      createdAt: invitationLink.createdAt,
    });
  } catch (error) {
    console.error('Error creating invitation link:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation link' },
      { status: 500 }
    );
  }
}

// GET /api/businesses/[id]/invitation-links - List invitation links for business
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;

    // Verify user owns this business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all invitation links for this business
    const invitationLinks = await prisma.businessInvitationLink.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      invitationLinks: invitationLinks.map((link) => ({
        id: link.id,
        code: link.code,
        expiresAt: link.expiresAt,
        maxUses: link.maxUses,
        usedCount: link.usedCount,
        isActive: link.isActive,
        createdBy: link.createdBy.displayName,
        createdAt: link.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching invitation links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation links' },
      { status: 500 }
    );
  }
}
