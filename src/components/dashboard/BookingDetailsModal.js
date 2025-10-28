/**
 * BookingDetailsModal Component
 * Full booking details view with actions
 */

'use client';

import { useState } from 'react';
import { X, User, Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import { formatDateTime, formatDuration, isPast } from '@/lib/dateUtils';

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
  const [notes, setNotes] = useState(booking?.notes || '');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  if (!isOpen || !booking) return null;

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
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Booking Details</h2>
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
                  <h3 className="font-semibold text-slate-900">Customer</h3>
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
                    <p className="text-sm text-slate-500">LINE User</p>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">Booking Information</h3>
                </div>
                <div className="ml-7 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date & Time</span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(booking.dateTime)}
                    </span>
                  </div>
                  {booking.service && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service</span>
                      <span className="font-medium text-slate-900">
                        {booking.service.name}
                      </span>
                    </div>
                  )}
                  {booking.staff && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Staff</span>
                      <span className="font-medium text-slate-900">
                        {booking.staff.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-medium text-slate-900">
                      {formatDuration(booking.duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Responses */}
              {booking.responses && Object.keys(booking.responses).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Customer Responses</h3>
                  </div>
                  <div className="ml-7 space-y-2">
                    {Object.entries(booking.responses).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-600">{key}</span>
                        <span className="font-medium text-slate-900 text-right max-w-xs">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {booking.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Cancelled</h3>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className="text-sm text-red-700">
                      Cancelled by: {booking.cancelledBy === 'owner' ? 'Business Owner' : 'Customer'}
                    </p>
                    {booking.cancelledAt && (
                      <p className="text-sm text-red-700">
                        Date: {formatDateTime(booking.cancelledAt)}
                      </p>
                    )}
                    {booking.cancellationReason && (
                      <p className="text-sm text-red-700">
                        Reason: {booking.cancellationReason}
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
                    <p className="font-semibold text-orange-900">Customer did not show up</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">Internal Notes</h3>
                </div>
                <div className="ml-7">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this booking (visible only to you)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  {notes !== booking.notes && (
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Notes'}
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
                  {isConfirming ? 'Confirming...' : 'Confirm Booking'}
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
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
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
                  {isMarkingNoShow ? 'Marking...' : 'Mark as No-Show'}
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
                  {isMarkingCompleted ? 'Marking...' : 'Mark as Completed'}
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-auto px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium"
              >
                Close
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
        title="Cancel Booking"
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        confirmColor="red"
        isLoading={isCancelling}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cancellation Reason (optional)
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="This will be sent to the customer via LINE"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
