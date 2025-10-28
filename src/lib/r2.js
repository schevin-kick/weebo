import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 Client
// R2 is S3-compatible, so we use the AWS SDK

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer|string} fileBuffer - File content
 * @param {string} key - File path in bucket (e.g., 'staff-photos/abc123.webp')
 * @param {string} contentType - MIME type (e.g., 'image/webp')
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadToR2(fileBuffer, key, contentType) {
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME environment variable is not set');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error(`Failed to upload to R2: ${error.message}`);
  }
}

/**
 * Generate a unique file key for R2 storage
 * @param {string} folder - Folder name (e.g., 'staff-photos', 'logos', 'qr-codes')
 * @param {string} extension - File extension (e.g., 'webp', 'png')
 * @returns {string} Unique key
 */
export function generateR2Key(folder, extension) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${folder}/${timestamp}-${random}.${extension}`;
}

export default { uploadToR2, generateR2Key };
