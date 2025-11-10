'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const { code } = params;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check authentication status
        const sessionResponse = await fetch('/api/auth/session');
        setIsAuthenticated(sessionResponse.ok);

        // Fetch invitation details
        const response = await fetch(`/api/invitation-links/${code}`);
        if (!response.ok) {
          throw new Error('Invitation not found');
        }
        const data = await response.json();
        setInvitation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchData();
    }
  }, [code]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitation-links/${code}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Redirect to the business dashboard
      router.push(`/${params.locale}/dashboard/${data.businessId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleLogin = () => {
    // Redirect to LINE login with return URL
    const returnUrl = encodeURIComponent(`/${params.locale}/join/${code}`);
    window.location.href = `/api/auth/login?returnUrl=${returnUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
          <p className="text-center mt-4 text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {t('invitationNotFound')}
            </h1>
            <p className="text-slate-600 mb-6">
              {error || t('invitationNotFoundDescription')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t('goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation.isValid) {
    let message = t('invitationInvalid');
    if (invitation.isExpired) {
      message = t('invitationExpired');
    } else if (invitation.isUsedUp) {
      message = t('invitationUsedUp');
    } else if (!invitation.isActive) {
      message = t('invitationDeactivated');
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {t('invitationInvalid')}
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t('goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('teamInvitation')}
          </h1>
          <p className="text-slate-600">
            {t('invitedBy', { name: invitation.invitedBy })}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {invitation.business.logoUrl && invitation.business.logoUrl.trim() !== '' && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                <Image
                  src={invitation.business.logoUrl}
                  alt={invitation.business.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {invitation.business.name}
              </h2>
              <p className="text-sm text-slate-600">
                {t('businessInvitation')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500 mb-6 text-center">
          {t('invitationExpiresAt', {
            date: new Date(invitation.expiresAt).toLocaleDateString(),
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {isAuthenticated ? (
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('accepting')}</span>
                </>
              ) : (
                <span>{t('acceptAndJoin')}</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t('loginWithLine')}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          {t('invitationSingleUse')}
        </p>
      </div>
    </div>
  );
}
