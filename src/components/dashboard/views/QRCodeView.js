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

export default function QRCodeView({ businessId }) {
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
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = qrSize * 0.2;
          const logoX = (qrSize - logoSize) / 2;
          const logoY = (qrSize - logoSize) / 2;

          // Draw white background circle for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(qrSize / 2, qrSize / 2, logoSize / 2 + 10, 0, 2 * Math.PI);
          ctx.fill();

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

          // Update data URL
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        };
        logo.onerror = () => {
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        };
        logo.src = business.logoUrl;
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${business.businessName}-QR-Code.${downloadFormat}`;
    link.href = qrDataUrl;
    link.click();

    toast.success('QR code downloaded');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${business.businessName}</title>
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
          <p>Scan to book an appointment</p>
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

    toast.success('Opening print dialog');
  };

  const handleCopyLink = () => {
    if (!business?.lineDeepLink) return;

    navigator.clipboard.writeText(business.lineDeepLink);
    setLinkCopied(true);
    toast.success('Link copied to clipboard');

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code Generator</h1>
          <p className="text-slate-600">Generate and share your booking QR code</p>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code Generator</h1>
          <p className="text-slate-600">Generate and share your booking QR code</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Refresh"
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
              Download
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Booking Link */}
          {business?.lineDeepLink && (
            <div className="mt-4 w-full max-w-md">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Booking Link:</p>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Customize QR Code</h3>

            {/* Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Size: {qrSize}px
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
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color
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
                    Show business logo in center
                  </span>
                </label>
                {showLogo && (
                  <p className="text-xs text-slate-500 mt-1 ml-6">
                    Logo will be overlaid on the QR code with white background
                  </p>
                )}
              </div>
            )}

            {/* Download Format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Download Format
              </label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="png">PNG (Recommended)</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Print and display at your business location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Share on social media or marketing materials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Include in email signatures or newsletters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Test the QR code before printing large batches</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
