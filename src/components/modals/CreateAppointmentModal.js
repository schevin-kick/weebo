/**
 * CreateAppointmentModal Component
 * Modal for business owners to create ad hoc appointments from the dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/portal/ModalPortal';
import { useTranslations, useLocale } from 'next-intl';
import { X, User, Mail, Phone, Calendar as CalendarIcon, Clock, Users, Briefcase, Loader2, ExternalLink } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addMinutes, isSameDay, set } from 'date-fns';

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  businessId,
  onSuccess,
}) {
  const t = useTranslations('dashboard.appointments');
  const locale = useLocale();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Data state
  const [business, setBusiness] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load business settings and services
  useEffect(() => {
    if (isOpen && businessId) {
      loadBusinessData();
    }
  }, [isOpen, businessId]);

  // Load bookings for selected date
  useEffect(() => {
    if (isOpen && selectedDate) {
      loadBookingsForDate();
    }
  }, [isOpen, selectedDate]);

  // Generate available time slots when date/service/staff changes
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedService, selectedStaff, existingBookings]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/${businessId}/settings`);
      if (!res.ok) throw new Error('Failed to load business data');
      const data = await res.json();
      setBusiness(data);

      // Set default duration from business settings
      if (!duration && data.defaultDuration) {
        setDuration(data.defaultDuration.toString());
      }
    } catch (err) {
      console.error('Error loading business data:', err);
      setError('Failed to load business settings');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsForDate = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(
        `/api/dashboard/${businessId}/bookings?date=${dateStr}`
      );
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setExistingBookings(data.bookings || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setExistingBookings([]);
    }
  };

  const generateTimeSlots = () => {
    if (!selectedDate) return;

    const slots = [];

    // Generate time slots for the entire day (00:00 to 23:30)
    const startHour = 0;
    const endHour = 24;
    const slotDuration = 30; // 30-minute intervals

    let currentTime = set(selectedDate, { hours: startHour, minutes: 0, seconds: 0 });
    const endTime = set(selectedDate, { hours: endHour, minutes: 0, seconds: 0 });

    while (currentTime < endTime) {
      const timeStr = format(currentTime, 'HH:mm');

      // Check if this time slot has existing bookings (for visual indicator only)
      // Show ALL bookings regardless of staff selection
      const hasBooking = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.dateTime);
        const bookingEnd = addMinutes(bookingStart, booking.duration);
        return (
          isSameDay(bookingStart, currentTime) &&
          currentTime >= bookingStart &&
          currentTime < bookingEnd &&
          ['pending', 'confirmed'].includes(booking.status)
        );
      });

      slots.push({
        time: timeStr,
        date: currentTime,
        isBooked: hasBooking, // Visual indicator only - does not prevent selection
      });

      currentTime = addMinutes(currentTime, slotDuration);
    }

    setAvailableSlots(slots);
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);

    // Update duration based on selected service
    if (serviceId && business) {
      const service = business.services.find((s) => s.id === serviceId);
      if (service && service.duration) {
        setDuration(service.duration.toString());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);

      const dateTime = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      };

      const payload = {
        businessId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || null,
        customerPhone: customerPhone.trim() || null,
        serviceId: selectedService || null,
        staffId: selectedStaff || null,
        dateTime,
        duration: duration ? parseInt(duration) : business.defaultDuration,
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      // Success!
      onSuccess();
      resetForm();
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedDate(new Date());
    setSelectedTime(null);
    setSelectedService('');
    setSelectedStaff('');
    setDuration('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold">{t('createTitle')}</h2>
                  <p className="text-orange-100 text-sm mt-1">{t('createSubtitle')}</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Custom Booking Form Button */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            {t('useCustomForm')}
                          </h4>
                          <p className="text-xs text-blue-700 mb-3">
                            {t('useCustomFormDesc')}
                          </p>
                          <a
                            href={`/${locale}/book?liff.state=%3Fbusiness_id%3D${businessId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                          >
                            {t('useCustomForm')}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Customer Info */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-500" />
                            {t('customerInfo')}
                          </h3>

                          {/* Customer Name */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('customerName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder={t('customerNamePlaceholder')}
                              required
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>

                          {/* Customer Phone */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {t('customerPhone')}
                            </label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder={t('customerPhonePlaceholder')}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>

                          {/* Customer Email */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {t('customerEmail')}
                            </label>
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder={t('customerEmailPlaceholder')}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Service & Staff Selection */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            {t('serviceDetails')}
                          </h3>

                          {/* Service Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('service')}
                            </label>
                            <select
                              value={selectedService}
                              onChange={handleServiceChange}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">{t('noService')}</option>
                              {business?.services
                                ?.filter((s) => s.isActive)
                                .map((service) => (
                                  <option key={service.id} value={service.id}>
                                    {service.name} ({service.duration} min)
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Staff Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {t('staff')}
                            </label>
                            <select
                              value={selectedStaff}
                              onChange={(e) => setSelectedStaff(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">{t('noStaff')}</option>
                              {business?.staff
                                ?.filter((s) => s.isActive)
                                .map((staff) => (
                                  <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Duration */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {t('duration')} (minutes)
                            </label>
                            <input
                              type="number"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder={business?.defaultDuration?.toString()}
                              min="15"
                              step="15"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('notes')}
                            </label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder={t('notesPlaceholder')}
                              rows={3}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Date & Time Selection */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-orange-500" />
                            {t('dateTime')}
                          </h3>

                          {/* Date Picker */}
                          <div className="mb-4">
                            <Calendar
                              onChange={setSelectedDate}
                              value={selectedDate}
                              minDate={new Date()}
                              className="w-full border border-slate-300 rounded-lg"
                            />
                          </div>

                          {/* Appointments List for Selected Date */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">
                              {t('todaysSchedule')}
                            </h4>
                            <div className="bg-slate-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                              {existingBookings.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">
                                  {t('noAppointments')}
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {existingBookings
                                    .filter((b) => ['pending', 'confirmed'].includes(b.status))
                                    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                                    .map((booking) => (
                                      <div
                                        key={booking.id}
                                        className="bg-white rounded-lg p-2 border border-slate-200"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-semibold text-slate-900">
                                                {format(new Date(booking.dateTime), 'HH:mm')}
                                              </span>
                                              <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                  booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                              >
                                                {booking.status}
                                              </span>
                                            </div>
                                            <p className="text-sm text-slate-700 truncate">
                                              {booking.customer?.displayName || t('fallbacks.unknownCustomer')}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                              <span>
                                                {booking.service?.name || t('noService')}
                                              </span>
                                              <span>•</span>
                                              <span>{booking.duration} min</span>
                                              {booking.staff && (
                                                <>
                                                  <span>•</span>
                                                  <span>{booking.staff.name}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('selectTime')}
                            </label>
                            {availableSlots.length === 0 ? (
                              <div className="text-center py-8 text-slate-500">
                                {t('noSlotsAvailable')}
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot.time}
                                    type="button"
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`
                                      px-3 py-2 rounded-lg text-sm font-medium transition-all relative
                                      ${
                                        selectedTime === slot.time
                                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                          : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
                                      }
                                      ${
                                        slot.isBooked && selectedTime !== slot.time
                                          ? 'border-l-4 border-l-orange-400'
                                          : ''
                                      }
                                    `}
                                  >
                                    {slot.time}
                                    {slot.isBooked && selectedTime !== slot.time && (
                                      <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || loading || !customerName || !selectedTime}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('creating')}
                    </>
                  ) : (
                    t('create')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
