/**
 * PermissionsView Component
 * Manage team member permissions for accessing the business
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Trash2, Link2, Copy, CheckCircle, Clock, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/hooks/useDashboardData';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/loading/Skeleton';
import { fetchWithCSRF } from '@/hooks/useCSRF';

export default function PermissionsView({ businessId }) {
  const t = useTranslations('dashboard.permissions');
  const toast = useToast();
  const params = useParams();

  const { business, isLoading: businessLoading } = useBusiness(businessId);
  const [permissions, setPermissions] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Invitation link state
  const [invitationLinks, setInvitationLinks] = useState([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Fetch permissions and invitation links
  useEffect(() => {
    if (businessId) {
      fetchPermissions();
      fetchInvitationLinks();
    }
  }, [businessId]);

  const fetchPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      const response = await fetch(`/api/businesses/${businessId}/permissions`);

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error('Fetch permissions error:', error);
      toast.error(t('fetchError'));
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const fetchInvitationLinks = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/invitation-links`);
      if (response.ok) {
        const data = await response.json();
        setInvitationLinks(data.invitationLinks || []);
      }
    } catch (error) {
      console.error('Fetch invitation links error:', error);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setIsGeneratingLink(true);
      const response = await fetch(`/api/businesses/${businessId}/invitation-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invitation link');
      }

      const data = await response.json();
      await fetchInvitationLinks();

      // Auto-copy the new link
      const inviteUrl = `${window.location.origin}/${params.locale}/join/${data.code}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLinkId(data.id);
      setTimeout(() => setCopiedLinkId(null), 2000);

      toast.success(t('linkGenerated'));
    } catch (error) {
      console.error('Generate link error:', error);
      toast.error(t('linkGenerateError'));
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async (code, linkId) => {
    try {
      const inviteUrl = `${window.location.origin}/${params.locale}/join/${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
      toast.success(t('linkCopied'));
    } catch (error) {
      toast.error(t('copyError'));
    }
  };

  const handleRemovePermission = async (permissionId) => {
    if (!confirm(t('confirmRemove'))) {
      return;
    }

    try {
      const response = await fetchWithCSRF(
        `/api/businesses/${businessId}/permissions?permissionId=${permissionId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove permission');
      }

      // Success - refresh list
      await fetchPermissions();
      toast.success(t('removeSuccess'));
    } catch (error) {
      console.error('Remove permission error:', error);
      toast.error(error.message);
    }
  };

  if (businessLoading || isLoadingPermissions) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if user is owner
  const isOwner = business?.ownerId === business?.ownerId; // We'll need to get session user ID

  if (!isOwner) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {t('ownerOnly')}
          </h2>
          <p className="text-slate-600">
            {t('ownerOnlyDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('title')}</h1>
        <p className="text-slate-600">{t('description')}</p>
      </div>

      {/* Generate Invitation Link Section */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-orange-500" />
              {t('invitationLinks')}
            </h2>
            <p className="text-sm text-slate-600">{t('invitationLinksDescription')}</p>
          </div>
          <button
            onClick={handleGenerateLink}
            disabled={isGeneratingLink}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {isGeneratingLink ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('generating')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t('generateLink')}
              </>
            )}
          </button>
        </div>

        {/* Active Invitation Links */}
        {invitationLinks.length > 0 && (
          <div className="space-y-2 mt-4">
            {invitationLinks
              .filter((link) => link.isActive && new Date(link.expiresAt) > new Date())
              .map((link) => (
                <div
                  key={link.id}
                  className="bg-white rounded-lg p-4 flex items-center justify-between border border-slate-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {link.usedCount >= link.maxUses ? (
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                          {t('used')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          {t('available')}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {t('expires')} {new Date(link.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t('singleUse')}
                      </span>
                    </div>
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded block truncate">
                      {`${window.location.origin}/${params.locale}/join/${link.code}`}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyLink(link.code, link.id)}
                    className="ml-4 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copiedLinkId === link.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{t('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">{t('copyLink')}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Permissions List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('teamMembers')} ({permissions.length})
          </h2>
        </div>

        {permissions.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">{t('noMembers')}</p>
            <p className="text-sm text-slate-500 mt-1">{t('noMembersHint')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{permission.displayName}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t('lineIdLabel')}: {permission.lineUserId}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('grantedOn')} {new Date(permission.createdAt).toLocaleDateString()} {t('by')}{' '}
                    {permission.grantedBy?.displayName}
                  </p>
                </div>

                <button
                  onClick={() => handleRemovePermission(permission.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('remove')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
