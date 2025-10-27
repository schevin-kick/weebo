/**
 * Get the day of week abbreviation (mon, tue, wed, etc.)
 */
function getDayOfWeek(date) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

/**
 * Check if a date is available based on business hours
 */
export function isDateAvailable(date, businessHours) {
  if (businessHours.mode === '24/7') {
    return true;
  }

  const dayOfWeek = getDayOfWeek(date);

  if (businessHours.mode === 'custom') {
    const dayConfig = businessHours.custom[dayOfWeek];
    return !dayConfig.closed;
  }

  // same-daily mode - all days are open
  return true;
}

/**
 * Check if a date is available based on staff hours (if applicable)
 */
export function isDateAvailableForStaff(date, staff, businessHours) {
  // If no staff selected or "any" staff, use business hours
  if (!staff || staff.id === 'any') {
    return isDateAvailable(date, businessHours);
  }

  // If staff has custom hours, use those
  if (staff.customHours) {
    const dayOfWeek = getDayOfWeek(date);
    const dayConfig = staff.customHours[dayOfWeek];
    return dayConfig && !dayConfig.closed;
  }

  // Otherwise, use business hours
  return isDateAvailable(date, businessHours);
}

/**
 * Get available hours for a given date
 */
export function getAvailableHours(date, businessHours, staff = null) {
  const dayOfWeek = getDayOfWeek(date);

  // If staff has custom hours, use those
  if (staff && staff.customHours) {
    const dayConfig = staff.customHours[dayOfWeek];
    if (!dayConfig || dayConfig.closed) {
      return { open: null, close: null };
    }
    return { open: dayConfig.open, close: dayConfig.close };
  }

  // Use business hours
  if (businessHours.mode === '24/7') {
    // If mode is 24/7 but sameDaily is configured, use sameDaily
    if (businessHours.sameDaily && businessHours.sameDaily.open && businessHours.sameDaily.close) {
      return businessHours.sameDaily;
    }
    return { open: '00:00', close: '23:59' };
  }

  if (businessHours.mode === 'custom') {
    const dayConfig = businessHours.custom[dayOfWeek];
    if (dayConfig.closed) {
      return { open: null, close: null };
    }
    return { open: dayConfig.open, close: dayConfig.close };
  }

  // same-daily mode
  if (businessHours.sameDaily) {
    return businessHours.sameDaily;
  }

  // Fallback to business hours during the day
  return { open: '09:00', close: '17:00' };
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Generate available time slots for a date
 */
export function generateTimeSlots(date, serviceDuration, businessHours, staff = null) {
  const availableHours = getAvailableHours(date, businessHours, staff);

  if (!availableHours.open || !availableHours.close) {
    return [];
  }

  const openMinutes = timeToMinutes(availableHours.open);
  const closeMinutes = timeToMinutes(availableHours.close);
  const slots = [];

  // Get current time if date is today
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  // Generate slots based on service duration
  for (let minutes = openMinutes; minutes + serviceDuration <= closeMinutes; minutes += serviceDuration) {
    // Skip past time slots for today
    if (isToday && minutes < currentMinutes) {
      continue;
    }

    slots.push({
      time: minutesToTime(minutes),
      available: true, // In future, this could check existing bookings
    });
  }

  return slots;
}

/**
 * Check if a specific time is available
 */
export function isTimeAvailable(date, time, serviceDuration, businessHours, staff = null) {
  const slots = generateTimeSlots(date, serviceDuration, businessHours, staff);
  return slots.some((slot) => slot.time === time && slot.available);
}

/**
 * Get the next 30 days of available dates
 */
export function getAvailableDates(businessHours, staff = null, daysAhead = 30) {
  const availableDates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const isAvailable = staff
      ? isDateAvailableForStaff(date, staff, businessHours)
      : isDateAvailable(date, businessHours);

    if (isAvailable) {
      availableDates.push(date);
    }
  }

  return availableDates;
}

/**
 * Format time for display (e.g., "14:00" -> "2:00 PM")
 */
export function formatTimeForDisplay(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
