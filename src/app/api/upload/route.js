import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToR2, generateR2Key } from '@/lib/r2';
import { uploadRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';
import { validateCSRFToken } from '@/lib/csrf';
import { detectLocaleFromRequest, translate } from '@/lib/localeUtils';

/**
 * POST /api/upload
 * Upload image to Cloudflare R2
 * Accepts multipart/form-data with 'file' field
 */
export async function POST(request) {
  try {
    const locale = detectLocaleFromRequest(request);

    // Check authentication
    const session = await getSession();
    if (!session) {
      const errorMessage = await translate(locale, 'api.errors.unauthorized');
      return NextResponse.json({ error: errorMessage }, { status: 401 });
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
      const errorMessage = await translate(locale, 'api.errors.invalidCsrf');
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads'; // staff-photos, logos, etc.

    if (!file) {
      const errorMessage = await translate(locale, 'api.upload.errors.noFile');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const errorMessage = await translate(locale, 'api.upload.errors.invalidType');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB after client-side optimization)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      const errorMessage = await translate(locale, 'api.upload.errors.tooLarge');
      return NextResponse.json(
        { error: errorMessage },
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
    const locale = detectLocaleFromRequest(request);
    const errorMessage = await translate(locale, 'api.upload.errors.failedToUpload');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
