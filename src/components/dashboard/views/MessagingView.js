/**
 * MessagingView Component
 * Manage LINE messaging templates and OAuth connection
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Link as LinkIcon, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useBusiness } from '@/hooks/useDashboardData';
import { useToast } from '@/contexts/ToastContext';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import Skeleton from '@/components/loading/Skeleton';
import LINEMessagePreview from '@/components/dashboard/LINEMessagePreview';
import { DEFAULT_TEMPLATES } from '@/lib/messageTemplates';

export default function MessagingView({ businessId }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const { business, isLoading, mutate } = useBusiness(businessId);
  const { markAsVisited } = useNotificationBadge('messaging', businessId);

  const [activeTab, setActiveTab] = useState('confirmation');
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [templates, setTemplates] = useState({
    confirmation: { ...DEFAULT_TEMPLATES.confirmation },
    cancellation: { ...DEFAULT_TEMPLATES.cancellation },
    reminder: { ...DEFAULT_TEMPLATES.reminder },
  });

  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24);

  // Mark as visited when component mounts
  useEffect(() => {
    markAsVisited();
  }, [markAsVisited]);

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'line_connected') {
      toast.success('LINE account connected successfully!');
      // Clean up URL
      window.history.replaceState({}, '', `/dashboard/${businessId}/messaging`);
      // Refresh business data to show new connection status
      mutate();
    } else if (error) {
      const errorMessages = {
        line_oauth_failed: 'Failed to connect LINE account. Please try again.',
        invalid_state: 'Invalid OAuth state. Please try again.',
        no_code: 'No authorization code received. Please try again.',
        oauth_callback_failed: 'OAuth callback failed. Please try again.',
        no_business: 'No business found. Please contact support.',
      };
      toast.error(errorMessages[error] || 'An error occurred. Please try again.');
      // Clean up URL
      window.history.replaceState({}, '', `/dashboard/${businessId}/messaging`);
    }
  }, [searchParams, businessId, toast, mutate]);

  // Load business data
  useEffect(() => {
    if (business) {
      // Parse message templates
      if (business.messageTemplates) {
        try {
          const parsedTemplates = typeof business.messageTemplates === 'string'
            ? JSON.parse(business.messageTemplates)
            : business.messageTemplates;
          setTemplates(parsedTemplates);
        } catch (error) {
          console.error('Failed to parse message templates:', error);
        }
      }

      setEnableReminders(business.enableReminders ?? true);
      setReminderHoursBefore(business.reminderHoursBefore ?? 24);
    }
  }, [business]);

  const handleTemplateChange = (type, field, value) => {
    setTemplates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/dashboard/${businessId}/messaging`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageTemplates: templates,
          enableReminders,
          reminderHoursBefore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save messaging settings');
      }

      toast.success('Messaging settings saved successfully');
      mutate();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save messaging settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectLINE = () => {
    // Redirect to LINE OAuth flow with businessId parameter
    window.location.href = `/api/line/oauth/connect?businessId=${businessId}`;
  };

  const getLINEConnectionStatus = () => {
    if (!business) return null;

    if (!business.lineChannelAccessToken) {
      return {
        connected: false,
        status: 'disconnected',
        icon: AlertCircle,
        color: 'text-slate-400',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        message: 'LINE account not connected',
      };
    }

    // Check expiration
    if (business.lineTokenExpiresAt) {
      const expiresAt = new Date(business.lineTokenExpiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 0) {
        return {
          connected: false,
          status: 'expired',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          message: 'LINE token expired - reconnection required',
        };
      }

      if (daysUntilExpiry <= 7) {
        return {
          connected: true,
          status: 'expiring_soon',
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          message: `Token expiring in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} - will auto-refresh`,
        };
      }
    }

    return {
      connected: true,
      status: 'active',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'LINE account connected',
    };
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messaging Settings</h1>
          <p className="text-slate-600">Customize LINE message templates</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" rounded="xl" />
          <Skeleton className="h-96" rounded="xl" />
        </div>
      </div>
    );
  }

  const connectionStatus = getLINEConnectionStatus();
  const StatusIcon = connectionStatus?.icon;
  const currentTemplate = templates[activeTab];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messaging Settings</h1>
          <p className="text-slate-600">Customize LINE message templates and connection</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* LINE Connection Status */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">LINE Integration</h2>
              <p className="text-sm text-slate-600">
                Connect your LINE Official Account to send messages
              </p>
            </div>

            <div className="p-6">
              {connectionStatus && (
                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border ${connectionStatus.bgColor} ${connectionStatus.borderColor} mb-4`}
                >
                  <StatusIcon className={`w-5 h-5 flex-shrink-0 ${connectionStatus.color}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${connectionStatus.color}`}>
                      {connectionStatus.message}
                    </div>
                    {business.lineTokenExpiresAt && connectionStatus.connected && (
                      <div className="text-xs text-slate-500 mt-1">
                        Token expires: {new Date(business.lineTokenExpiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleConnectLINE}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <LinkIcon className="w-4 h-4" />
                {connectionStatus?.connected ? 'Reconnect LINE Account' : 'Connect LINE Account'}
              </button>

              <p className="text-xs text-slate-500 mt-3">
                Messages will be sent from your LINE Official Account when connected.
                {!connectionStatus?.connected && ' Requires LINE Official Account with Messaging API enabled.'}
              </p>
            </div>
          </div>

          {/* Message Template Editor */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Message Templates</h2>
              <p className="text-sm text-slate-600">
                Customize the header and body text for each message type
              </p>
            </div>

            {/* Template Type Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex">
                {[
                  { id: 'confirmation', label: 'Confirmation', color: 'green' },
                  { id: 'cancellation', label: 'Cancellation', color: 'red' },
                  { id: 'reminder', label: 'Reminder', color: 'orange' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Form */}
            <div className="p-6 space-y-4">
              {/* Header Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Header Text
                </label>
                <input
                  type="text"
                  value={currentTemplate.header}
                  onChange={(e) => handleTemplateChange(activeTab, 'header', e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter header text..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    Bold text shown at the top of the message
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentTemplate.header.length}/100
                  </p>
                </div>
              </div>

              {/* Body Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Body Text
                </label>
                <textarea
                  value={currentTemplate.body}
                  onChange={(e) => handleTemplateChange(activeTab, 'body', e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Enter body text..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    Additional message details shown below the header
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentTemplate.body.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Reminder Settings</h2>
              <p className="text-sm text-slate-600">
                Automatically send reminder messages before appointments
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Enable Reminders Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Enable Reminders</div>
                  <div className="text-sm text-slate-600">
                    Send automated reminders to customers
                  </div>
                </div>
                <button
                  onClick={() => setEnableReminders(!enableReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableReminders ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hours Before Input */}
              {enableReminders && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Send reminder (hours before appointment)
                  </label>
                  <input
                    type="number"
                    value={reminderHoursBefore}
                    onChange={(e) => setReminderHoursBefore(parseInt(e.target.value) || 24)}
                    min={1}
                    max={168}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Default is 24 hours (1 day) before the appointment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <LINEMessagePreview
            type={activeTab}
            header={currentTemplate.header}
            body={currentTemplate.body}
            business={business}
          />
        </div>
      </div>
    </div>
  );
}
