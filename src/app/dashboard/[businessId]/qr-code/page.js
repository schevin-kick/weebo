/**
 * QR Code Page
 * Browser-based QR code generator with booking flow configuration
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import QRCodeLib from 'qrcode';
import {
  Download,
  Printer,
  Copy,
  Check,
  Settings as SettingsIcon,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/contexts/ToastContext';

export default function QRCodePage() {
  const params = useParams();
  const businessId = params.businessId;
  const toast = useToast();
  const canvasRef = useRef(null);

  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // QR Code settings
  const [qrSize, setQrSize] = useState(400);
  const [qrColor, setQrColor] = useState('#000000');
  const [showLogo, setShowLogo] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Active tab for booking flow config
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    loadData();
  }, [businessId]);

  useEffect(() => {
    // Use a small delay to ensure canvas is mounted
    const timer = setTimeout(() => {
      if (business && canvasRef.current) {
        generateQRCode();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [business, qrSize, qrColor, showLogo]);

  async function loadData() {
    try {
      // Load user session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        window.location.href = '/api/auth/login';
        return;
      }
      setUser(sessionData.user);

      // Load businesses
      const bizRes = await fetch('/api/businesses');
      const bizData = await bizRes.json();
      setBusinesses(bizData.businesses || []);

      // Load current business
      const businessRes = await fetch(`/api/businesses/${businessId}`);
      const businessData = await businessRes.json();
      console.log('Business data from API:', businessData);
      setBusiness(businessData.business || businessData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load business data');
      setLoading(false);
    }
  }

  async function generateQRCode() {
    console.log('generateQRCode called', {
      hasLineDeepLink: !!business?.lineDeepLink,
      hasCanvas: !!canvasRef.current,
      lineDeepLink: business?.lineDeepLink
    });

    if (!business?.lineDeepLink || !canvasRef.current) {
      console.log('Early return - missing lineDeepLink or canvas ref');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const options = {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: '#FFFFFF',
        },
        errorCorrectionLevel: showLogo ? 'H' : 'M', // High error correction for logo overlay
      };

      console.log('Generating QR code with options:', options);
      // Generate QR code
      await QRCodeLib.toCanvas(canvas, business.lineDeepLink, options);
      console.log('QR code generated successfully');

      // If logo is enabled and available, overlay it
      if (showLogo && business.logoUrl) {
        const ctx = canvas.getContext('2d');
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = qrSize * 0.2; // Logo is 20% of QR code size
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
          console.log('Setting QR data URL with logo, length:', dataUrl.length);
          setQrDataUrl(dataUrl);
        };
        logo.onerror = () => {
          console.error('Failed to load logo, setting QR without logo');
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        };
        logo.src = business.logoUrl;
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Setting QR data URL without logo, length:', dataUrl.length);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} businesses={businesses} currentBusinessId={businessId}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code & Booking Flow</h1>
          <p className="text-slate-600">
            Generate your QR code and manage your booking flow configuration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: QR Code Generator */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">QR Code Generator</h2>

              {/* QR Code Preview */}
              <div className="flex justify-center mb-6">
                <div className="relative" style={{ width: qrSize, height: qrSize }}>
                  <canvas
                    ref={canvasRef}
                    width={qrSize}
                    height={qrSize}
                    className="border-2 border-slate-200 rounded-lg shadow-lg"
                  />
                  {!qrDataUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                      <p className="text-slate-500">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4 mb-6">
                {/* Size Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Size: {qrSize}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="50"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Logo Toggle */}
                {business?.logoUrl && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Show business logo in center
                      </span>
                    </label>
                  </div>
                )}

                {/* Download Format */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Download Format
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="png"
                        checked={downloadFormat === 'png'}
                        onChange={(e) => setDownloadFormat(e.target.value)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">PNG</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="svg"
                        checked={downloadFormat === 'svg'}
                        onChange={(e) => setDownloadFormat(e.target.value)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">SVG</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-5 h-5" />
                  Print
                </button>
              </div>

              {/* Shareable Link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={business?.lineDeepLink || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    {linkCopied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Flow Configuration */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Booking Flow Configuration
                </h2>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Customers will scan this QR code to access your booking form. Configure what
                they'll see in the Settings page.
              </p>

              {/* Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-1">
                  {['services', 'staff', 'pages'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'services' && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Services</h3>
                    {business?.services?.length > 0 ? (
                      <div className="space-y-2">
                        {business.services.map((service) => (
                          <div
                            key={service.id}
                            className="p-3 border border-slate-200 rounded-lg"
                          >
                            <p className="font-medium text-slate-900">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-slate-600 mt-1">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>{service.duration} minutes</span>
                              {service.price && <span>${service.price}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No services configured</p>
                    )}
                  </div>
                )}

                {activeTab === 'staff' && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Staff Members</h3>
                    {business?.staff?.length > 0 ? (
                      <div className="space-y-2">
                        {business.staff.map((member) => (
                          <div
                            key={member.id}
                            className="p-3 border border-slate-200 rounded-lg flex items-center gap-3"
                          >
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-slate-500 font-medium">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{member.name}</p>
                              {member.specialty && (
                                <p className="text-sm text-slate-600">{member.specialty}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No staff members configured</p>
                    )}
                  </div>
                )}

                {activeTab === 'pages' && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Booking Form Pages</h3>
                    {business?.pages?.length > 0 ? (
                      <div className="space-y-2">
                        {business.pages
                          .sort((a, b) => a.order - b.order)
                          .map((page, index) => (
                            <div
                              key={page.id}
                              className="p-3 border border-slate-200 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <p className="font-medium text-slate-900">{page.title}</p>
                                <span className="ml-auto text-xs text-slate-500 capitalize">
                                  {page.type.replace('preset-', '')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No pages configured</p>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Settings Button */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => window.location.href = `/dashboard/${businessId}/settings`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
                >
                  <SettingsIcon className="w-5 h-5" />
                  Edit in Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
