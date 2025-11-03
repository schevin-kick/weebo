/**
 * BookingDetailsModal Component
 * Full booking details view with actions
 */

'use client';

import { useState } from 'react';
import { X, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import ModalPortal from '@/components/portal/ModalPortal';
import { isPast } from '@/lib/dateUtils';
import { formatDateTime, formatDuration } from '@/lib/localizedDateUtils';
import { useTranslations, useLocale } from 'next-intl';

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onUpdateNotes,
  onMarkNoShow,
  onMarkCompleted,
}) {
  const t = useTranslations('dashboard.calendar.modal');
  const tTime = useTranslations('common.time');
  const locale = useLocale();
  const [notes, setNotes] = useState(booking?.notes || '');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  if (!isOpen || !booking) return null;

  // Helper function to get label for a component ID from business pages
  const getComponentLabel = (componentId) => {
    if (!booking.business?.pages) return null;

    for (const page of booking.business.pages) {
      if (page.components && Array.isArray(page.components)) {
        const component = page.components.find(c => c.id === componentId);
        if (component) {
          return component.label || component.title || null;
        }
      }
    }
    return null;
  };

  const canConfirm = booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canMarkNoShow = booking.status === 'confirmed' && isPast(booking.dateTime);
  const canMarkCompleted = booking.status === 'confirmed' && isPast(booking.dateTime);

  const handleSaveNotes = async () => {
    if (notes === booking.notes) return;

    setIsSaving(true);
    try {
      await onUpdateNotes(booking.id, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(booking.id);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    setIsCancelling(true);
    try {
      await onCancel(booking.id, cancellationReason || null);
      setCancellationReason('');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMarkNoShow = async () => {
    setIsMarkingNoShow(true);
    try {
      await onMarkNoShow(booking.id);
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsMarkingCompleted(true);
    try {
      await onMarkCompleted(booking.id);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('title')}</h2>
                <StatusBadge status={booking.status} />
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">{t('customer')}</h3>
                </div>
                <div className="flex items-center gap-3 ml-7">
                  {booking.customer?.pictureUrl && (
                    <img
                      src={booking.customer.pictureUrl}
                      alt={booking.customer.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {booking.customer?.displayName || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">{t('lineUser')}</p>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">{t('bookingInfo')}</h3>
                </div>
                <div className="ml-7 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('dateTime')}</span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(booking.dateTime, locale)}
                    </span>
                  </div>
                  {booking.service && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('service')}</span>
                      <span className="font-medium text-slate-900">
                        {booking.service.name}
                      </span>
                    </div>
                  )}
                  {booking.staff && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('staff')}</span>
                      <span className="font-medium text-slate-900">
                        {booking.staff.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('duration')}</span>
                    <span className="font-medium text-slate-900">
                      {formatDuration(booking.duration, tTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Responses */}
              {booking.responses && Object.keys(booking.responses).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">{t('customerResponses')}</h3>
                  </div>
                  <div className="ml-7 space-y-2">
                    {Object.entries(booking.responses).map(([key, value]) => {
                      // Check if key is a UUID (internal field ID)
                      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      const isUUID = uuidPattern.test(key);

                      // Get human-readable label if available
                      const label = isUUID ? getComponentLabel(key) : null;
                      const displayLabel = label || (isUUID ? t('response') : key);

                      return (
                        <div key={key} className="flex justify-between gap-4">
                          <span className="text-slate-600">
                            {displayLabel}
                          </span>
                          <span className="font-medium text-slate-900 text-right max-w-xs break-words">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {booking.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">{t('cancelled')}</h3>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className="text-sm text-red-700">
                      {t('cancelledBy')}: {booking.cancelledBy === 'owner' ? t('businessOwner') : t('customer')}
                    </p>
                    {booking.cancelledAt && (
                      <p className="text-sm text-red-700">
                        {t('date')}: {formatDateTime(booking.cancelledAt, locale)}
                      </p>
                    )}
                    {booking.cancellationReason && (
                      <p className="text-sm text-red-700">
                        {t('reason')}: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* No Show Badge */}
              {booking.noShow && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="font-semibold text-orange-900">{t('noShow')}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">{t('internalNotes')}</h3>
                </div>
                <div className="ml-7">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  {notes !== booking.notes && (
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isSaving ? t('saving') : t('saveNotes')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap gap-3">
              {canConfirm && (
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConfirming && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isConfirming ? t('confirming') : t('confirmBooking')}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCancelling && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isCancelling ? t('cancelling') : t('cancelBooking')}
                </button>
              )}
              {canMarkNoShow && !booking.noShow && (
                <button
                  onClick={handleMarkNoShow}
                  disabled={isMarkingNoShow}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isMarkingNoShow && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isMarkingNoShow ? t('marking') : t('markNoShow')}
                </button>
              )}
              {canMarkCompleted && booking.status !== 'completed' && (
                <button
                  onClick={handleMarkCompleted}
                  disabled={isMarkingCompleted}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isMarkingCompleted && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isMarkingCompleted ? t('marking') : t('markCompleted')}
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-auto px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          if (!isCancelling) {
            setShowCancelDialog(false);
            setCancellationReason('');
          }
        }}
        onConfirm={handleCancel}
        title={t('cancelDialog.title')}
        confirmText={t('cancelDialog.confirmText')}
        cancelText={t('cancelDialog.cancelText')}
        confirmColor="red"
        isLoading={isCancelling}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('cancelDialog.reasonLabel')}
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder={t('cancelDialog.reasonPlaceholder')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </ConfirmDialog>
    </ModalPortal>
  );
}
