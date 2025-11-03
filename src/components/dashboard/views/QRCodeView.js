/**
 * QRCodeView Component
 * QR Code generator with download, print, and customization options
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';
import { Download, Printer, Copy, Check, RefreshCw } from 'lucide-react';
import { useBusiness } from '@/hooks/useDashboardData';
import Skeleton from '@/components/loading/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from 'next-intl';

export default function QRCodeView({ businessId }) {
  const t = useTranslations('dashboard.qrCode');
  const toast = useToast();
  const canvasRef = useRef(null);

  // Fetch business data
  const { business, isLoading, mutate } = useBusiness(businessId);

  // QR Code settings
  const [qrSize, setQrSize] = useState(400);
  const [qrColor, setQrColor] = useState('#000000');
  const [showLogo, setShowLogo] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate QR code whenever settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (business && canvasRef.current) {
        generateQRCode();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [business, qrSize, qrColor, showLogo]);

  async function generateQRCode() {
    if (!business?.lineDeepLink || !canvasRef.current) {
      console.log('QR Code generation skipped:', {
        hasLineDeepLink: !!business?.lineDeepLink,
        hasCanvas: !!canvasRef.current,
        lineDeepLink: business?.lineDeepLink
      });
      return;
    }

    console.log('Generating QR code for:', business.lineDeepLink);
    try {
      const canvas = canvasRef.current;
      const options = {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: '#FFFFFF',
        },
        errorCorrectionLevel: showLogo ? 'H' : 'M',
      };

      // Generate QR code
      await QRCodeLib.toCanvas(canvas, business.lineDeepLink, options);

      // If logo is enabled and available, overlay it
      if (showLogo && business.logoUrl) {
        const ctx = canvas.getContext('2d');
        const logo = new Image();

        logo.onload = () => {
          const logoSize = qrSize * 0.2;
          const centerX = qrSize / 2;
          const centerY = qrSize / 2;

          // Draw white background circle for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2 + 10, 0, 2 * Math.PI);
          ctx.fill();

          // Calculate aspect ratio for object-fit: cover behavior
          const imgAspect = logo.width / logo.height;
          const circleAspect = 1; // Circle is always 1:1

          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspect > circleAspect) {
            // Image is wider - fit to height and crop sides
            drawHeight = logoSize;
            drawWidth = drawHeight * imgAspect;
            drawX = centerX - drawWidth / 2;
            drawY = centerY - drawHeight / 2;
          } else {
            // Image is taller - fit to width and crop top/bottom
            drawWidth = logoSize;
            drawHeight = drawWidth / imgAspect;
            drawX = centerX - drawWidth / 2;
            drawY = centerY - drawHeight / 2;
          }

          // Draw logo with circular clip (object-fit: cover)
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logo, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          // Update data URL
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        };
        logo.onerror = (error) => {
          console.error('Failed to load logo:', business.logoUrl, error);
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        };

        // Use proxy API to avoid CORS issues with external images
        const logoUrl = business.logoUrl.startsWith('http')
          ? `/api/proxy-image?url=${encodeURIComponent(business.logoUrl)}`
          : business.logoUrl;
        logo.src = logoUrl;
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(t('messages.generateFailed'));
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${business.businessName}-QR-Code.${downloadFormat}`;
    link.href = qrDataUrl;
    link.click();

    toast.success(t('messages.downloaded'));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('print.title', { businessName: business.businessName })}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 10px;
              color: #1e293b;
            }
            p {
              margin-bottom: 20px;
              color: #64748b;
            }
            img {
              max-width: 400px;
              border: 1px solid #e2e8f0;
              padding: 20px;
              background: white;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h1>${business.businessName}</h1>
          <p>${t('print.scanToBook')}</p>
          <img src="${qrDataUrl}" alt="QR Code" />
          <p style="margin-top: 20px; font-size: 0.875rem;">${business.lineDeepLink}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success(t('messages.printOpened'));
  };

  const handleCopyLink = () => {
    if (!business?.lineDeepLink) return;

    navigator.clipboard.writeText(business.lineDeepLink);
    setLinkCopied(true);
    toast.success(t('messages.linkCopied'));

    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRefresh = () => {
    mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Skeleton width="400px" height="400px" rounded="xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">{t('subtitle')}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title={t('refreshTitle')}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              {t('actions.download')}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              {t('actions.print')}
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{t('actions.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('actions.copyLink')}
                </>
              )}
            </button>
          </div>

          {/* Booking Link */}
          {business?.lineDeepLink && (
            <div className="mt-4 w-full max-w-md">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">{t('bookingLink')}</p>
                <p className="text-sm text-slate-900 break-all font-mono">
                  {business.lineDeepLink}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('customize.title')}</h3>

            {/* Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('customize.size', { size: qrSize })}
              </label>
              <input
                type="range"
                min="200"
                max="800"
                step="50"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{t('customize.sizeSmall')}</span>
                <span>{t('customize.sizeLarge')}</span>
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('customize.color')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Logo */}
            {business?.logoUrl && (
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {t('customize.showLogo')}
                  </span>
                </label>
                {showLogo && (
                  <p className="text-xs text-slate-500 mt-1 ml-6">
                    {t('customize.logoNote')}
                  </p>
                )}
              </div>
            )}

            {/* Download Format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('customize.downloadFormat')}
              </label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="png">{t('customize.formatPNG')}</option>
                <option value="jpg">{t('customize.formatJPG')}</option>
              </select>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('usageTips.title')}</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{t('usageTips.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{t('usageTips.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{t('usageTips.tip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{t('usageTips.tip4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
