/**
 * MessagingView Component
 * Manage LINE messaging templates and OAuth connection
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, CheckCircle, AlertCircle, Info, Eye, EyeOff, Key } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useBusiness } from '@/hooks/useDashboardData';
import { useToast } from '@/contexts/ToastContext';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import Skeleton from '@/components/loading/Skeleton';
import LINEMessagePreview from '@/components/dashboard/LINEMessagePreview';
import { getLocalizedTemplates } from '@/lib/messageTemplates';
import LineBotIdHelpModal from '@/components/modals/LineBotIdHelpModal';
import LineTokenHelpModal from '@/components/modals/LineTokenHelpModal';

export default function MessagingView({ businessId }) {
  const t = useTranslations('dashboard.messaging');
  const locale = useLocale();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { business, isLoading, mutate } = useBusiness(businessId);
  const { markAsVisited } = useNotificationBadge('messaging', businessId);

  const [activeTab, setActiveTab] = useState('confirmation');
  const [isSaving, setIsSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTokenHelpModal, setShowTokenHelpModal] = useState(false);

  // Form state - use localized templates based on user's locale
  const localizedTemplates = getLocalizedTemplates(locale);
  const [templates, setTemplates] = useState({
    confirmation: { ...localizedTemplates.confirmation },
    cancellation: { ...localizedTemplates.cancellation },
    reminder: { ...localizedTemplates.reminder },
  });

  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24);
  const [lineBotBasicId, setLineBotBasicId] = useState('');
  const [botIdError, setBotIdError] = useState('');
  const [channelAccessToken, setChannelAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // New messaging mode state
  const [messagingMode, setMessagingMode] = useState('shared');
  const [webhookAcknowledged, setWebhookAcknowledged] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSettingUpWebhook, setIsSettingUpWebhook] = useState(false);
  const [heroBackgroundColor, setHeroBackgroundColor] = useState('#FFFFFF');

  // Mark as visited when component mounts
  useEffect(() => {
    markAsVisited();
  }, [markAsVisited]);

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'line_connected') {
      toast.success(t('success.lineConnected'));
      // Clean up URL
      window.history.replaceState({}, '', `/dashboard/${businessId}/messaging`);
      // Refresh business data to show new connection status
      mutate();
    } else if (error) {
      toast.error(t('errors.connectionFailed'));
      // Clean up URL
      window.history.replaceState({}, '', `/dashboard/${businessId}/messaging`);
    }
  }, [searchParams, businessId, toast, mutate]);

  // Load business data
  useEffect(() => {
    if (business) {
      // Parse message templates - use localized defaults for English default values
      if (business.messageTemplates) {
        try {
          const parsedTemplates = typeof business.messageTemplates === 'string'
            ? JSON.parse(business.messageTemplates)
            : business.messageTemplates;

          // Default English templates (what we want to replace)
          const englishDefaults = {
            confirmation: { header: 'Your booking is confirmed!', body: 'We look forward to seeing you!' },
            cancellation: { header: 'Booking Cancelled', body: 'Your booking has been cancelled. We hope to see you again soon!' },
            reminder: { header: 'Reminder: Upcoming Appointment', body: "Don't forget your appointment tomorrow!" },
          };

          // Replace English defaults with localized versions
          const localizedTemplates = getLocalizedTemplates(locale);
          const mergedTemplates = {};

          ['confirmation', 'cancellation', 'reminder'].forEach(type => {
            mergedTemplates[type] = {
              header: parsedTemplates[type]?.header === englishDefaults[type]?.header
                ? localizedTemplates[type].header
                : (parsedTemplates[type]?.header || localizedTemplates[type].header),
              body: parsedTemplates[type]?.body === englishDefaults[type]?.body
                ? localizedTemplates[type].body
                : (parsedTemplates[type]?.body || localizedTemplates[type].body),
            };
          });

          setTemplates(mergedTemplates);
        } catch (error) {
          console.error('Failed to parse message templates:', error);
        }
      }

      setEnableReminders(business.enableReminders ?? true);
      setReminderHoursBefore(business.reminderHoursBefore ?? 24);
      setLineBotBasicId(business.lineBotBasicId || '');
      // Don't load the actual token for security - just show if it exists
      setChannelAccessToken(business.lineChannelAccessToken ? '••••••••' : '');

      // Load messaging mode settings
      setMessagingMode(business.messagingMode || 'shared');
      setWebhookAcknowledged(business.webhookAcknowledged || false);
      setWebhookConfigured(business.webhookConfigured || false);
      setWebhookUrl(business.webhookUrl || '');
      setHeroBackgroundColor(business.heroBackgroundColor || '#FFFFFF');
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
      setBotIdError(t('lineConfig.botIdMustStartWith'));
      return false;
    }

    if (!/^@[a-zA-Z0-9]+$/.test(value)) {
      setBotIdError(t('lineConfig.botIdInvalidFormat'));
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
      toast.error(t('lineConfig.fixBotIdFormat'));
      return;
    }

    setIsSaving(true);

    try {
      const body = {
        messageTemplates: templates,
        enableReminders,
        reminderHoursBefore,
        lineBotBasicId: lineBotBasicId || null,
        messagingMode,
        webhookAcknowledged,
        heroBackgroundColor,
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

      toast.success(t('success.settingsSaved'));
      mutate();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupWebhook = async () => {
    if (!channelAccessToken || channelAccessToken === '••••••••') {
      toast.error(t('lineConfig.enterTokenFirst'));
      return;
    }

    if (!lineBotBasicId) {
      toast.error(t('lineConfig.enterBotIdFirst'));
      return;
    }

    setIsSettingUpWebhook(true);

    try {
      const response = await fetch(`/api/dashboard/${businessId}/messaging/setup-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelAccessToken,
          lineBotBasicId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup webhook');
      }

      setWebhookConfigured(true);
      setWebhookUrl(data.webhookUrl);
      toast.success(t('webhook.successTitle'));
      mutate(); // Refresh business data
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast.error(t('errors.webhookSetupFailed'));
    } finally {
      setIsSettingUpWebhook(false);
    }
  };

  const isLineConnected = business?.lineChannelAccessToken ? true : false;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">{t('subtitle')}</p>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-600">{t('subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t('saving') : t('saveButton')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Messaging Mode Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('messagingMode.title')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              {t('messagingMode.description')}
            </p>

            <div className="space-y-3">
              {/* Option A: Shared Bot */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${messagingMode === 'shared'
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}>
                <input
                  type="radio"
                  name="messagingMode"
                  value="shared"
                  checked={messagingMode === 'shared'}
                  onChange={(e) => setMessagingMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{t('messagingMode.shared.title')}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {t('messagingMode.shared.description')}
                  </div>
                </div>
              </label>

              {/* Option B: Own Bot */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${messagingMode === 'own_bot'
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}>
                <input
                  type="radio"
                  name="messagingMode"
                  value="own_bot"
                  checked={messagingMode === 'own_bot'}
                  onChange={(e) => setMessagingMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{t('messagingMode.ownBot.title')}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {t('messagingMode.ownBot.description')}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* LINE Integration - Only show for own_bot mode */}
          {messagingMode === 'own_bot' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('lineConfig.title')}</h2>
                <p className="text-sm text-slate-600">
                  {t('lineConfig.description')}
                </p>
              </div>

              <div className="p-6">
                {/* Connection Status Badge */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border mb-4 ${isLineConnected
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
                  }`}>
                  {isLineConnected ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${isLineConnected ? 'text-green-600' : 'text-slate-600'
                      }`}>
                      {isLineConnected ? t('lineConfig.credentialsSaved') : t('lineConfig.credentialsNotConfigured')}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {isLineConnected
                        ? t('lineConfig.credentialsSavedDesc')
                        : t('lineConfig.credentialsNotConfiguredDesc')}
                    </p>
                  </div>
                </div>

                {/* Manual Channel Access Token Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <Key className="w-4 h-4 inline mr-1" />
                      {t('lineConfig.channelAccessToken')}
                    </label>
                    <button
                      onClick={() => setShowTokenHelpModal(true)}
                      className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {t('lineConfig.howToGetToken')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={channelAccessToken}
                      onChange={(e) => setChannelAccessToken(e.target.value)}
                      placeholder={t('lineConfig.channelAccessTokenPlaceholder')}
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
                    {t('lineConfig.channelAccessTokenHelp')}
                  </p>
                </div>

                {/* Bot Basic ID Input */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {t('lineConfig.botBasicId')}
                    </label>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {t('lineConfig.howToFindId')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={lineBotBasicId}
                    onChange={(e) => handleBotIdChange(e.target.value)}
                    placeholder={t('lineConfig.botBasicIdPlaceholder')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${botIdError ? 'border-red-300' : 'border-slate-300'
                      }`}
                  />
                  {botIdError && (
                    <p className="text-xs text-red-600 mt-1">{botIdError}</p>
                  )}
                  {!botIdError && lineBotBasicId && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t('lineConfig.validBotIdFormat')}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {t('lineConfig.botBasicIdHelp')}
                  </p>
                </div>

                {/* Webhook Setup Section */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('webhook.title')}</h3>

                  {/* Webhook warning */}
                  {!webhookAcknowledged && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-amber-900">{t('webhook.importantTitle')}</div>
                          <div className="text-sm text-amber-800 mt-1">
                            {t('webhook.importantMessage')}
                          </div>
                          <label className="flex items-center gap-2 mt-3">
                            <input
                              type="checkbox"
                              checked={webhookAcknowledged}
                              onChange={(e) => setWebhookAcknowledged(e.target.checked)}
                              className="rounded border-amber-300"
                            />
                            <span className="text-sm">{t('webhook.acknowledge')}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook setup button */}
                  {webhookAcknowledged && (
                    <div>
                      <button
                        onClick={handleSetupWebhook}
                        disabled={!channelAccessToken || channelAccessToken === '••••••••' || !lineBotBasicId || isSettingUpWebhook}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSettingUpWebhook ? t('webhook.settingUp') : (webhookConfigured ? t('webhook.reconfigureButton') : t('webhook.setupButton'))}
                      </button>

                      {webhookConfigured && webhookUrl && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-green-900">{t('webhook.successTitle')}</div>
                                <div className="text-xs text-green-700 mt-1 font-mono break-all">{webhookUrl}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900">{t('webhook.enableInConsoleTitle')}</div>
                                <div className="text-xs text-blue-700 mt-1">
                                  {t('webhook.enableInConsoleMessage')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message Template Editor */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('templates.title')}</h2>
              <p className="text-sm text-slate-600">
                {t('templates.description')}
              </p>
            </div>

            {/* Template Type Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex">
                {[
                  { id: 'confirmation', label: t('templates.confirmation'), color: 'green' },
                  { id: 'cancellation', label: t('templates.cancellation'), color: 'red' },
                  { id: 'reminder', label: t('templates.reminder'), color: 'orange' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
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
                  {t('templates.headerText')}
                </label>
                <input
                  type="text"
                  value={currentTemplate.header}
                  onChange={(e) => handleTemplateChange(activeTab, 'header', e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('templates.headerPlaceholder')}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    {t('templates.headerHelp')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentTemplate.header.length}/100
                  </p>
                </div>
              </div>

              {/* Body Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('templates.bodyText')}
                </label>
                <textarea
                  value={currentTemplate.body}
                  onChange={(e) => handleTemplateChange(activeTab, 'body', e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder={t('templates.bodyPlaceholder')}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    {t('templates.bodyHelp')}
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
              <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('reminder.title')}</h2>
              <p className="text-sm text-slate-600">
                {t('reminder.description')}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Enable Reminders Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{t('reminder.enableReminders')}</div>
                  <div className="text-sm text-slate-600">
                    {t('reminder.enableRemindersDesc')}
                  </div>
                </div>
                <button
                  onClick={() => setEnableReminders(!enableReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableReminders ? 'bg-orange-500' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Hours Before Input */}
              {enableReminders && (
                <div>
                  <p className="text-sm text-slate-600">
                    {t('reminder.scheduleInfo')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hero Background Color */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                {t('heroBackground.title')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('heroBackground.description')}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                {t('heroBackground.backgroundColorLabel')}
              </label>

              {/* Preset Color Options */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { name: t('heroBackground.white'), value: '#FFFFFF' },
                  { name: t('heroBackground.lightGray'), value: '#F1F5F9' },
                  { name: t('heroBackground.darkGray'), value: '#1E293B' },
                  { name: t('heroBackground.black'), value: '#000000' },
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setHeroBackgroundColor(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      heroBackgroundColor === color.value
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2 border border-slate-200"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="text-xs font-medium text-slate-700 text-center">
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">{t('heroBackground.customLabel')}</label>
                <input
                  type="color"
                  value={heroBackgroundColor}
                  onChange={(e) => setHeroBackgroundColor(e.target.value)}
                  className="w-16 h-10 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={heroBackgroundColor}
                  onChange={(e) => setHeroBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  placeholder={t('heroBackground.customPlaceholder')}
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                {t('heroBackground.previewNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="h-full">
          <div className="lg:sticky lg:top-20">
            <LINEMessagePreview
              type={activeTab}
              header={currentTemplate.header}
              body={currentTemplate.body}
              business={{ ...business, heroBackgroundColor }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="mt-8 flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          {isSaving ? t('saving') : t('saveButton')}
        </button>
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
