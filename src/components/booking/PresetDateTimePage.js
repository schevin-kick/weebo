'use client';

import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  generateTimeSlots,
  isDateAvailable,
  isDateAvailableForStaff,
  formatTimeForDisplay,
} from '@/utils/dateTimeAvailability';

export default function PresetDateTimePage({
  page,
  selectedDateTime,
  onSelect,
  businessHours,
  selectedService,
  selectedStaff,
  staff,
  defaultAppointmentDuration = 60,
}) {
  const [selectedDate, setSelectedDate] = useState(
    selectedDateTime?.date ? new Date(selectedDateTime.date + 'T00:00:00') : null
  );
  const [selectedTime, setSelectedTime] = useState(selectedDateTime?.time || null);

  // Get the selected staff member object if applicable
  const staffMember = useMemo(() => {
    if (!selectedStaff || selectedStaff === 'any') return null;
    return staff.find((s) => s.id === selectedStaff);
  }, [selectedStaff, staff]);

  // Check if a date should be disabled
  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Check availability based on business/staff hours
    if (staffMember) {
      return !isDateAvailableForStaff(date, staffMember, businessHours);
    }

    return !isDateAvailable(date, businessHours);
  };

  // Generate available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    // Use service duration if available, otherwise use default appointment duration
    const duration = selectedService?.duration || defaultAppointmentDuration || 60;

    return generateTimeSlots(
      selectedDate,
      duration,
      businessHours,
      staffMember
    );
  }, [selectedDate, selectedService, defaultAppointmentDuration, businessHours, staffMember]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes

    // Don't update store yet, wait for time selection
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);

    // Format date as YYYY-MM-DD
    const dateString = selectedDate.toISOString().split('T')[0];

    // Update store with both date and time
    onSelect({
      date: dateString,
      time: time,
    });
  };

  // Custom tile className for styling
  const tileClassName = ({ date }) => {
    if (tileDisabled({ date })) return 'disabled-date';

    const isSelected =
      selectedDate &&
      date.toDateString() === selectedDate.toDateString();

    if (isSelected) return 'selected-date';

    return '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{page.title}</h2>

      {/* Duration info */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-orange-600" />
          <span className="text-orange-900 font-medium">
            {selectedService ? (
              <>Appointment Duration: {selectedService.duration} minutes</>
            ) : (
              <>Default Appointment Duration: {defaultAppointmentDuration || 60} minutes</>
            )}
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CalendarIcon className="w-4 h-4" />
          <span>Select Date</span>
        </div>

        <div className="kitsune-calendar">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            minDate={new Date()}
            locale="en-US"
            className="border-2 border-slate-200 rounded-xl p-4 w-full"
          />
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock className="w-4 h-4" />
            <span>Select Time</span>
          </div>

          {availableTimeSlots.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <p className="text-slate-600">
                No available time slots for this date. Please select another date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-xl border-2 font-medium text-sm transition-all min-h-[48px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                        : slot.available
                        ? 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm text-slate-700'
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {formatTimeForDisplay(slot.time)}
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedDate && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-slate-600">
            Please select a date from the calendar above
          </p>
        </div>
      )}

      <style jsx global>{`
        /* Calendar custom styles */
        .kitsune-calendar .react-calendar {
          border: none;
          font-family: inherit;
        }

        .kitsune-calendar .react-calendar__tile {
          padding: 0.75rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .kitsune-calendar .react-calendar__tile:enabled:hover {
          background-color: #fff7ed;
          color: #ea580c;
        }

        .kitsune-calendar .react-calendar__tile--active {
          background: linear-gradient(to bottom right, #f97316, #f59e0b);
          color: white;
        }

        .kitsune-calendar .react-calendar__tile.selected-date {
          background: linear-gradient(to bottom right, #f97316, #f59e0b);
          color: white;
          font-weight: 600;
        }

        .kitsune-calendar .react-calendar__tile.disabled-date {
          background-color: #f8fafc;
          color: #cbd5e1;
          cursor: not-allowed;
        }

        .kitsune-calendar .react-calendar__tile.disabled-date:hover {
          background-color: #f8fafc;
        }

        .kitsune-calendar .react-calendar__navigation button {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          padding: 0.75rem;
          border-radius: 0.5rem;
        }

        .kitsune-calendar .react-calendar__navigation button:enabled:hover {
          background-color: #fff7ed;
        }

        .kitsune-calendar .react-calendar__month-view__weekdays {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .kitsune-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }

        .kitsune-calendar .react-calendar__tile--now {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 500;
        }

        .kitsune-calendar .react-calendar__tile--now:enabled:hover {
          background-color: #fde68a;
        }
      `}</style>
    </div>
  );
}
