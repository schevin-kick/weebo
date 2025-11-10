import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * GET /api/businesses/[id]/permissions
 * List all permissions for a business (owner only)
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;

    // Verify user owns the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden - Only business owner can view permissions' }, { status: 403 });
    }

    // Fetch all permissions for this business
    const permissions = await prisma.businessPermission.findMany({
      where: { businessId },
      include: {
        grantedBy: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/businesses/[id]/permissions
 * Add a new permission (owner only)
 */
export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { id: businessId } = await params;

    // Verify user owns the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden - Only business owner can add permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { lineUserId, displayName } = body;

    // Validate inputs
    if (!lineUserId || !displayName) {
      return NextResponse.json({ error: 'LINE User ID and display name are required' }, { status: 400 });
    }

    // Validate LINE User ID format (should start with 'U' and be 33 characters)
    if (!lineUserId.startsWith('U') || lineUserId.length !== 33) {
      return NextResponse.json({ error: 'Invalid LINE User ID format' }, { status: 400 });
    }

    // Check if permission already exists
    const existingPermission = await prisma.businessPermission.findUnique({
      where: {
        businessId_lineUserId: {
          businessId,
          lineUserId,
        },
      },
    });

    if (existingPermission) {
      return NextResponse.json({ error: 'Permission already exists for this user' }, { status: 409 });
    }

    // Check if user is trying to add themselves (owner already has access)
    if (lineUserId === session.lineUserId) {
      return NextResponse.json({ error: 'Cannot add permission for yourself - you are the owner' }, { status: 400 });
    }

    // Create the permission
    const permission = await prisma.businessPermission.create({
      data: {
        businessId,
        lineUserId,
        displayName,
        grantedById: session.id,
      },
      include: {
        grantedBy: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({ permission }, { status: 201 });
  } catch (error) {
    console.error('Create permission error:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/businesses/[id]/permissions
 * Remove a permission (owner only)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { id: businessId } = await params;
    const { searchParams } = new URL(request.url);
    const permissionId = searchParams.get('permissionId');

    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    // Verify user owns the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden - Only business owner can remove permissions' }, { status: 403 });
    }

    // Verify permission exists and belongs to this business
    const permission = await prisma.businessPermission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    if (permission.businessId !== businessId) {
      return NextResponse.json({ error: 'Permission does not belong to this business' }, { status: 403 });
    }

    // Delete the permission
    await prisma.businessPermission.delete({
      where: { id: permissionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete permission error:', error);
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    );
  }
}
