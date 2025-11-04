/**
 * NotificationsView Component
 * Manage LINE notification settings and bot connection
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';
import { Bell, CheckCircle, AlertCircle, ExternalLink, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBusiness } from '@/hooks/useDashboardData';
import { useToast } from '@/contexts/ToastContext';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import Skeleton from '@/components/loading/Skeleton';

const KITSUNE_BOT_ID = '@470ejmoi';
const KITSUNE_BOT_URL = `https://line.me/R/ti/p/${KITSUNE_BOT_ID}`;

export default function NotificationsView({ businessId }) {
  const t = useTranslations('dashboard.notifications');
  const toast = useToast();
  const canvasRef = useRef(null);
  const { business, isLoading, mutate } = useBusiness(businessId);
  const { markAsVisited } = useNotificationBadge('notifications', businessId);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Mark as visited when component mounts
  useEffect(() => {
    markAsVisited();
  }, [markAsVisited]);

  // Load business settings
  useEffect(() => {
    if (business) {
      setNotificationsEnabled(business.notificationsEnabled ?? true);
    }
  }, [business]);

  // Generate QR code
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        generateQRCode();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  async function generateQRCode() {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const options = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      };

      await QRCodeLib.toCanvas(canvas, KITSUNE_BOT_URL, options);
      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(t('qrError'));
    }
  }

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/dashboard/${businessId}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationsEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      toast.success(t('success'));
      mutate();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = business && notificationsEnabled !== (business.notificationsEnabled ?? true);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" rounded="xl" />
          <Skeleton className="h-64" rounded="xl" />
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
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t('saving') : t('save')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-slate-900">{t('status.title')}</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">{t('status.enable')}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {t('status.enableDescription')}
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {!notificationsEnabled && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">{t('notificationsDisabled.title')}</p>
                    <p className="mt-1">
                      {t('notificationsDisabled.description')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Types */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('types.title')}</h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-4 h-4 text-orange-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{t('types.newBookings.title')}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {t('types.newBookings.description')}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-4 h-4 text-orange-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{t('types.cancellations.title')}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {t('types.cancellations.description')}
                  </div>
                </div>
              </label>

            </div>
          </div>
        </div>

        {/* Right Column - Bot Setup */}
        <div className="space-y-6">
          {/* Kitsune Bot Connection */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('bot.title')}</h2>
              <p className="text-sm text-slate-600">
                {t('bot.description')}
              </p>
            </div>

            <div className="p-6">
              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
                  <canvas ref={canvasRef} className="max-w-full" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-slate-700 mb-1">{t('bot.qrCode.scanToAdd')}</p>
                  <p className="text-xs text-slate-500">{t('bot.qrCode.botId', { botId: KITSUNE_BOT_ID })}</p>
                </div>
              </div>

              {/* Add Friend Button */}
              <a
                href={KITSUNE_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B] transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                {t('bot.addButton')}
              </a>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('bot.setup.title')}</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-medium mt-0.5">1.</span>
                    <span>{t('bot.setup.step1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium mt-0.5">2.</span>
                    <span>{t('bot.setup.step2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium mt-0.5">3.</span>
                    <span>{t('bot.setup.step3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium mt-0.5">4.</span>
                    <span>{t('bot.setup.step4')}</span>
                  </li>
                </ol>
              </div>

              {/* Important Note */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">{t('bot.important.title')}</p>
                    <p className="mt-1">
                      {t('bot.important.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      {hasChanges && (
        <div className="mt-8 flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t('saving') : t('save')}
          </button>
        </div>
      )}
    </div>
  );
}
