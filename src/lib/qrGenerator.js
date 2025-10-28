import QRCode from 'qrcode';
import { uploadToR2 } from './r2.js';

/**
 * Generate QR code for a business and upload to R2
 * @param {string} businessId - Business ID
 * @param {string} liffId - LINE LIFF app ID
 * @returns {Promise<{qrCodeUrl: string, lineDeepLink: string}>}
 */
export async function generateBusinessQRCode(businessId, liffId) {
  try {
    // Create LIFF deep link
    const lineDeepLink = `https://liff.line.me/${liffId}?business_id=${businessId}`;

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(lineDeepLink, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M', // Medium error correction
    });

    // Upload to R2
    const r2Key = `qr-codes/${businessId}.png`;
    const qrCodeUrl = await uploadToR2(qrCodeBuffer, r2Key, 'image/png');

    return {
      qrCodeUrl,
      lineDeepLink,
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate QR code as data URL (for client-side preview)
 * @param {string} businessId - Business ID
 * @param {string} liffId - LINE LIFF app ID
 * @returns {Promise<string>} Data URL
 */
export async function generateQRCodeDataURL(businessId, liffId) {
  const lineDeepLink = `https://liff.line.me/${liffId}?business_id=${businessId}`;

  try {
    const dataUrl = await QRCode.toDataURL(lineDeepLink, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    return dataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code preview');
  }
}

export default { generateBusinessQRCode, generateQRCodeDataURL };
