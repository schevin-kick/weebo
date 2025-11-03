/**
 * BookingDetailMobile Component
 * Mobile-optimized standalone booking detail view
 * Used for LINE notification deep links
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, FileText, AlertCircle, Check, X } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { formatDateTime, formatDuration, isPast } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithCSRF } from '@/hooks/useCSRF';

export default function BookingDetailMobile({ booking }) {
  const router = useRouter();
  const toast = useToast();
  const [notes, setNotes] = useState(booking?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

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

  const handleBackToDashboard = () => {
    router.push(`/dashboard/${booking.business.id}`);
  };

  const handleSaveNotes = async () => {
    if (notes === booking.notes) return;

    setIsUpdating(true);
    try {
      const response = await fetchWithCSRF(`/api/bookings/${booking.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Failed to save notes');

      toast.success('Notes saved successfully');
      booking.notes = notes; // Update local state
    } catch (error) {
      console.error('Save notes error:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      const response = await fetchWithCSRF(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      toast.success('Booking confirmed successfully');
      router.refresh();
    } catch (error) {
      console.error('Confirm error:', error);
      toast.error('Failed to confirm booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    setIsUpdating(true);
    try {
      const response = await fetchWithCSRF(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: cancellationReason || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast.success('Booking cancelled successfully');
      setCancellationReason('');
      router.refresh();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkNoShow = async () => {
    setIsUpdating(true);
    try {
      const response = await fetchWithCSRF(`/api/bookings/${booking.id}/no-show`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to mark as no-show');

      toast.success('Marked as no-show');
      router.refresh();
    } catch (error) {
      console.error('No-show error:', error);
      toast.error('Failed to mark as no-show');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsUpdating(true);
    try {
      const response = await fetchWithCSRF(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) throw new Error('Failed to mark as completed');

      toast.success('Marked as completed');
      router.refresh();
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('Failed to mark as completed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {booking.business.businessName}
            </h1>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 pb-32">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Customer</h3>
          </div>
          <div className="flex items-center gap-3">
            {booking.customer?.pictureUrl && (
              <img
                src={booking.customer.pictureUrl}
                alt={booking.customer.displayName}
                className="w-12 h-12 rounded-full"
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Appointment Details</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Date & Time</span>
              <span className="font-medium text-slate-900 text-right">
                {formatDateTime(booking.dateTime)}
              </span>
            </div>
            {booking.service && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Service</span>
                <span className="font-medium text-slate-900 text-right">
                  {booking.service.name}
                </span>
              </div>
            )}
            {booking.staff && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Staff</span>
                <span className="font-medium text-slate-900 text-right">
                  {booking.staff.name}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Duration</span>
              <span className="font-medium text-slate-900 text-right">
                {formatDuration(booking.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Responses */}
        {booking.responses && Object.keys(booking.responses).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Customer Responses</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(booking.responses).map(([key, value]) => {
                const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const isUUID = uuidPattern.test(key);
                const label = isUUID ? getComponentLabel(key) : null;
                const displayLabel = label || (isUUID ? 'Response' : key);

                return (
                  <div key={key} className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{displayLabel}</span>
                    <span className="font-medium text-slate-900 text-right break-words max-w-[60%]">
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Cancelled</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-red-700">
                Cancelled by: {booking.cancelledBy === 'owner' ? 'Business Owner' : 'Customer'}
              </p>
              {booking.cancelledAt && (
                <p className="text-red-700">
                  Date: {formatDateTime(booking.cancelledAt)}
                </p>
              )}
              {booking.cancellationReason && (
                <p className="text-red-700">
                  Reason: {booking.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* No Show Badge */}
        {booking.noShow && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="font-semibold text-orange-900">Customer did not show up</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Internal Notes</h3>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this booking (visible only to you)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
            rows={4}
          />
          {notes !== booking.notes && (
            <button
              onClick={handleSaveNotes}
              disabled={isUpdating}
              className="mt-3 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save Notes'}
            </button>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg safe-area-pb">
        <div className="flex flex-col gap-3">
          {canConfirm && (
            <button
              onClick={handleConfirm}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-5 h-5" />
              {isUpdating ? 'Confirming...' : 'Confirm Booking'}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-5 h-5" />
              {isUpdating ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            {canMarkNoShow && !booking.noShow && (
              <button
                onClick={handleMarkNoShow}
                disabled={isUpdating}
                className="py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 font-medium disabled:opacity-50 text-sm transition-colors"
              >
                {isUpdating ? 'Marking...' : 'Mark No-Show'}
              </button>
            )}
            {canMarkCompleted && booking.status !== 'completed' && (
              <button
                onClick={handleMarkCompleted}
                disabled={isUpdating}
                className="py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 active:bg-slate-800 font-medium disabled:opacity-50 text-sm transition-colors"
              >
                {isUpdating ? 'Marking...' : 'Mark Completed'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Booking</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to cancel this booking? The customer will be notified via LINE.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cancellation Reason (optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="This will be sent to the customer via LINE"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-base"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancellationReason('');
                  }}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 active:bg-slate-100 font-medium transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 font-medium transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
