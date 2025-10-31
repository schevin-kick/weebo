/**
 * MessagingView Component
 * Manage LINE messaging templates and OAuth connection
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, CheckCircle, AlertCircle, Info, Eye, EyeOff, Key } from 'lucide-react';
import { useBusiness } from '@/hooks/useDashboardData';
import { useToast } from '@/contexts/ToastContext';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import Skeleton from '@/components/loading/Skeleton';
import LINEMessagePreview from '@/components/dashboard/LINEMessagePreview';
import { DEFAULT_TEMPLATES } from '@/lib/messageTemplates';
import LineBotIdHelpModal from '@/components/modals/LineBotIdHelpModal';
import LineTokenHelpModal from '@/components/modals/LineTokenHelpModal';

export default function MessagingView({ businessId }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const { business, isLoading, mutate } = useBusiness(businessId);
  const { markAsVisited } = useNotificationBadge('messaging', businessId);

  const [activeTab, setActiveTab] = useState('confirmation');
  const [isSaving, setIsSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTokenHelpModal, setShowTokenHelpModal] = useState(false);

  // Form state
  const [templates, setTemplates] = useState({
    confirmation: { ...DEFAULT_TEMPLATES.confirmation },
    cancellation: { ...DEFAULT_TEMPLATES.cancellation },
    reminder: { ...DEFAULT_TEMPLATES.reminder },
  });

  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24);
  const [lineBotBasicId, setLineBotBasicId] = useState('');
  const [botIdError, setBotIdError] = useState('');
  const [channelAccessToken, setChannelAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);

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
      setLineBotBasicId(business.lineBotBasicId || '');
      // Don't load the actual token for security - just show if it exists
      setChannelAccessToken(business.lineChannelAccessToken ? '••••••••' : '');
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

  const validateBotId = (value) => {
    if (!value) {
      setBotIdError('');
      return true;
    }

    if (!value.startsWith('@')) {
      setBotIdError('Bot ID must start with @');
      return false;
    }

    if (!/^@[a-zA-Z0-9]+$/.test(value)) {
      setBotIdError('Bot ID must contain only letters and numbers after @');
      return false;
    }

    setBotIdError('');
    return true;
  };

  const handleBotIdChange = (value) => {
    setLineBotBasicId(value);
    validateBotId(value);
  };

  const handleSave = async () => {
    // Validate bot ID before saving
    if (lineBotBasicId && !validateBotId(lineBotBasicId)) {
      toast.error('Please fix the Bot Basic ID format');
      return;
    }

    setIsSaving(true);

    try {
      const body = {
        messageTemplates: templates,
        enableReminders,
        reminderHoursBefore,
        lineBotBasicId: lineBotBasicId || null,
      };

      // Only include token if it's been changed (not the masked value)
      if (channelAccessToken && channelAccessToken !== '••••••••') {
        body.lineChannelAccessToken = channelAccessToken;
      }

      const response = await fetch(`/api/dashboard/${businessId}/messaging`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const isLineConnected = business?.lineChannelAccessToken ? true : false;

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
              {/* Connection Status Badge */}
              <div className={`flex items-start gap-3 p-4 rounded-lg border mb-4 ${
                isLineConnected
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {isLineConnected ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-slate-400" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${
                    isLineConnected ? 'text-green-600' : 'text-slate-600'
                  }`}>
                    {isLineConnected ? 'LINE Messaging API Connected' : 'LINE Messaging API Not Connected'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLineConnected
                      ? 'Your bot can send messages to customers'
                      : 'Add your Channel Access Token below to enable messaging'}
                  </p>
                </div>
              </div>

              {/* Manual Channel Access Token Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <Key className="w-4 h-4 inline mr-1" />
                    Channel Access Token
                  </label>
                  <button
                    onClick={() => setShowTokenHelpModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    How do I get this?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={channelAccessToken}
                    onChange={(e) => setChannelAccessToken(e.target.value)}
                    placeholder="Enter your LINE Channel Access Token"
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Get this from LINE Developers Console → Your Channel → Messaging API → Channel access token (long-lived)
                </p>
              </div>

              {/* Bot Basic ID Input */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Bot Basic ID
                  </label>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    How do I find this?
                  </button>
                </div>
                <input
                  type="text"
                  value={lineBotBasicId}
                  onChange={(e) => handleBotIdChange(e.target.value)}
                  placeholder="@abc1234"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    botIdError ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {botIdError && (
                  <p className="text-xs text-red-600 mt-1">{botIdError}</p>
                )}
                {!botIdError && lineBotBasicId && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Valid Bot ID format
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Your LINE bot's unique identifier (e.g., @abc1234). This allows customers to add your bot as a friend.
                </p>
              </div>
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

      {/* Help Modals */}
      <LineBotIdHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      <LineTokenHelpModal
        isOpen={showTokenHelpModal}
        onClose={() => setShowTokenHelpModal(false)}
      />
    </div>
  );
}
