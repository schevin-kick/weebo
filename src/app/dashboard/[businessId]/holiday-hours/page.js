/**
 * Holiday Hours Page
 * Manage closed dates and holiday hours
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar as CalendarIcon, Trash2, Plus, Clock, CalendarX } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { formatDate, formatTime, formatDateTime } from '@/lib/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';

export default function HolidayHoursPage() {
  const params = useParams();
  const businessId = params.businessId;
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [closureType, setClosureType] = useState('full-day'); // 'full-day' or 'partial'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [adding, setAdding] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      // Load user session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        window.location.href = '/api/auth/login';
        return;
      }
      setUser(sessionData.user);

      // Load businesses
      const bizRes = await fetch('/api/businesses');
      const bizData = await bizRes.json();
      setBusinesses(bizData.businesses || []);

      // Load closed dates
      await loadClosedDates();

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  }

  async function loadClosedDates() {
    try {
      const response = await fetch(`/api/closed-dates?businessId=${businessId}`);
      const data = await response.json();
      setClosedDates(data.closedDates || []);
    } catch (error) {
      console.error('Error loading closed dates:', error);
      toast.error('Failed to load closed dates');
    }
  }

  async function handleAddClosedPeriod() {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setAdding(true);

    try {
      let startDateTime, endDateTime;

      if (closureType === 'full-day') {
        // Full day: start at 00:00:00, end at 23:59:59
        startDateTime = startOfDay(new Date(startDate));
        endDateTime = endOfDay(new Date(endDate));
      } else {
        // Partial hours: use selected times
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

      // Reload data
      await loadClosedDates();
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

      // Reload data
      await loadClosedDates();
    } catch (error) {
      console.error('Error deleting closed period:', error);
      toast.error('Failed to delete closed period');
    }
  }

  const isFullDay = (closedDate) => {
    const start = new Date(closedDate.startDateTime);
    const end = new Date(closedDate.endDateTime);

    // Check if start is at 00:00:00 and end is at 23:59:59
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} businesses={businesses} currentBusinessId={businessId}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Holiday Hours</h1>
          <p className="text-slate-600">
            Manage special closures and holiday hours for your business
          </p>
        </div>

        {/* Add Closed Period Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-600" />
            Add Closed Period
          </h2>

          {/* Step 1: Choose Closure Type */}
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
                      closureType === 'full-day'
                        ? 'border-orange-500'
                        : 'border-slate-300'
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
                      closureType === 'partial'
                        ? 'border-orange-500'
                        : 'border-slate-300'
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

          {/* Step 2: Date Selection */}
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
                min={startDate}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Selection (only for partial hours) */}
          {closureType === 'partial' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
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
                  <Clock className="w-4 h-4 inline mr-1" />
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

          {/* Add Button */}
          <button
            onClick={handleAddClosedPeriod}
            disabled={adding || !startDate || !endDate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {adding ? 'Adding...' : 'Add Closed Period'}
          </button>
        </div>

        {/* List of Closed Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-orange-600" />
            Scheduled Closures
          </h2>

          {closedDates.length === 0 ? (
            <div className="text-center py-12">
              <CalendarX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No closed periods scheduled</p>
              <p className="text-sm text-slate-400 mt-1">
                Add closures for holidays, vacations, or special occasions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {closedDates.map((closedDate) => (
                <div
                  key={closedDate.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {isFullDay(closedDate) ? (
                        <CalendarX className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {formatClosedPeriod(closedDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isFullDay(closedDate) ? 'Full Day Closure' : 'Partial Hours'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDeleteId(closedDate.id);
                      setShowDeleteDialog(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
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
        message="Are you sure you want to remove this closed period? Customers will be able to book during this time."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </DashboardLayout>
  );
}
