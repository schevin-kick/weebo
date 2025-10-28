import imageCompression from 'browser-image-compression';

/**
 * Optimize an image file before upload
 * - Compresses to max 500KB
 * - Resizes to max 1200px width/height
 * - Converts to WebP format for better compression
 *
 * @param {File} file - Original image file
 * @returns {Promise<File>} Optimized image file
 */
export async function optimizeImage(file) {
  const options = {
    maxSizeMB: 0.5, // Target 500KB max
    maxWidthOrHeight: 1200, // Max dimension
    useWebWorker: true,
    fileType: 'image/webp', // Convert to WebP for better compression
    initialQuality: 0.85, // Start with 85% quality
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default 1MB)
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateImageFile(file, maxSizeMB = 1) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, WebP, or GIF)',
    };
  }

  const maxBytes = maxSizeMB * 1048576;
  if (file.size > maxBytes) {
    const sizeMB = (file.size / 1048576).toFixed(2);
    return {
      valid: false,
      error: `Image is too large (${sizeMB}MB). Maximum size is ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

export default { optimizeImage, validateImageFile };
