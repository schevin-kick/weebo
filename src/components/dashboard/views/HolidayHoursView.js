/**
 * HolidayHoursView Component
 * Manage closed dates and holiday hours
 */

'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Calendar as CalendarIcon, Trash2, Plus, RefreshCw } from 'lucide-react';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Skeleton from '@/components/loading/Skeleton';
import { formatDate, formatTime, formatDateTime } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import { format, startOfDay, endOfDay } from 'date-fns';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function HolidayHoursView({ businessId }) {
  const toast = useToast();

  // Fetch closed dates using SWR
  const { data, isLoading, mutate } = useSWR(
    businessId ? `/api/closed-dates?businessId=${businessId}` : null,
    fetcher
  );

  const closedDates = data?.closedDates || [];

  // Form state
  const [closureType, setClosureType] = useState('full-day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [adding, setAdding] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleAddClosedPeriod() {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setAdding(true);

    try {
      let startDateTime, endDateTime;

      if (closureType === 'full-day') {
        startDateTime = startOfDay(new Date(startDate));
        endDateTime = endOfDay(new Date(endDate));
      } else {
        startDateTime = new Date(`${startDate}T${startTime}`);
        endDateTime = new Date(`${endDate}T${endTime}`);
      }

      const response = await fetch('/api/closed-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add closed period');

      toast.success('Closed period added');

      // Reset form
      setStartDate('');
      setEndDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      setClosureType('full-day');

      // Revalidate data
      mutate();
    } catch (error) {
      console.error('Error adding closed period:', error);
      toast.error('Failed to add closed period');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/closed-dates/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Closed period deleted');
      setShowDeleteDialog(false);
      setDeleteId(null);

      // Revalidate data
      mutate();
    } catch (error) {
      console.error('Error deleting closed period:', error);
      toast.error('Failed to delete closed period');
    }
  }

  const isFullDay = (closedDate) => {
    const start = new Date(closedDate.startDateTime);
    const end = new Date(closedDate.endDateTime);

    return (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 23 &&
      end.getMinutes() === 59
    );
  };

  const formatClosedPeriod = (closedDate) => {
    const start = new Date(closedDate.startDateTime);
    const end = new Date(closedDate.endDateTime);
    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');

    if (isFullDay(closedDate)) {
      if (isSameDay) {
        return `${formatDate(start)} - Full Day`;
      } else {
        return `${formatDate(start)} - ${formatDate(end)} - Full Days`;
      }
    } else {
      if (isSameDay) {
        return `${formatDate(start)} from ${formatTime(start)} to ${formatTime(end)}`;
      } else {
        return `${formatDateTime(start)} to ${formatDateTime(end)}`;
      }
    }
  };

  const handleRefresh = () => {
    mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Holiday Hours</h1>
          <p className="text-slate-600">Manage special closures and holiday hours</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64" rounded="xl" />
          <Skeleton className="h-32" rounded="xl" />
          <Skeleton className="h-32" rounded="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Holiday Hours</h1>
          <p className="text-slate-600">
            Manage special closures and holiday hours for your business
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Add Closed Period Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-orange-600" />
          Add Closed Period
        </h2>

        {/* Closure Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Closure Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setClosureType('full-day')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                closureType === 'full-day'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    closureType === 'full-day' ? 'border-orange-500' : 'border-slate-300'
                  }`}
                >
                  {closureType === 'full-day' && (
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Full Day Closure</p>
                  <p className="text-xs text-slate-500">Closed for entire day(s)</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setClosureType('partial')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                closureType === 'partial'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    closureType === 'partial' ? 'border-orange-500' : 'border-slate-300'
                  }`}
                >
                  {closureType === 'partial' && (
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Partial Hours</p>
                  <p className="text-xs text-slate-500">Closed for specific hours</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Time Selection (only for partial closures) */}
        {closureType === 'partial' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleAddClosedPeriod}
          disabled={adding}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding...' : 'Add Closed Period'}
        </button>
      </div>

      {/* Closed Dates List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Scheduled Closures</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {closedDates.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No closed periods scheduled</p>
            </div>
          ) : (
            closedDates.map((closedDate) => (
              <div
                key={closedDate.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatClosedPeriod(closedDate)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDeleteId(closedDate.id);
                    setShowDeleteDialog(true);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Closed Period"
        message="Are you sure you want to delete this closed period? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
