import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToR2, generateR2Key } from '@/lib/r2';
import { uploadRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * POST /api/upload
 * Upload image to Cloudflare R2
 * Accepts multipart/form-data with 'file' field
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting (5 uploads per minute)
    const identifier = getIdentifier(request, session);
    const rateLimitResult = await checkRateLimit(uploadRateLimit, identifier);

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

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads'; // staff-photos, logos, etc.

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF' },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB after client-side optimization)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 1MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension
    const extension = file.type.split('/')[1];

    // Generate unique key
    const key = generateR2Key(folder, extension);

    // Upload to R2
    const publicUrl = await uploadToR2(buffer, key, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
