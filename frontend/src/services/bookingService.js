import { getItem, setItem, STORAGE_KEYS } from './storage';
import { eventService } from './eventService';
import { apiClient } from './apiClient';

export const bookingService = {
  syncMyBookings: async () => {
    try {
      const res = await apiClient.get('/registrations/me');
      if (res?.bookings && Array.isArray(res.bookings)) {
        setItem(STORAGE_KEYS.BOOKINGS, res.bookings);
        return res.bookings;
      }
    } catch {
      // Return whatever is cached if network fails
    }
    return getItem(STORAGE_KEYS.BOOKINGS, []);
  },

  getUserBookings: (userId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.userId === userId || b.attendeeId === userId);
  },

  getEventAttendees: async (eventId) => {
    try {
      const res = await apiClient.get(`/organizer/events/${eventId}/attendees`);
      if (res?.attendees) {
        return res.attendees;
      }
    } catch {
      // Fallback to local cache
    }
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.eventId === eventId && b.status !== 'cancelled');
  },

  getEventAvailability: (eventOrId) => {
    let event = eventOrId;
    if (typeof eventOrId === 'string') {
      event = eventService.getEventById(eventOrId);
    }
    if (!event) return { available: false, reason: 'Event not found' };

    const today = new Date().toISOString().split('T')[0];
    const confirmedCount = event.registeredCount || 0;
    const capacity = event.capacity || 0;
    const remainingSpots = Math.max(0, capacity - confirmedCount);

    if (event.status === 'cancelled') {
      return {
        available: false,
        reason: 'This event has been cancelled and cannot accept new registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (event.status === 'draft') {
      return {
        available: false,
        reason: 'This event is currently in draft mode and is not yet open to public registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (event.startDate < today || event.status === 'past' || event.status === 'completed') {
      return {
        available: false,
        reason: 'This event has already passed and cannot accept new registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (remainingSpots <= 0 && capacity > 0) {
      return {
        available: false,
        reason: 'This event has reached full capacity.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    return {
      available: true,
      reason: null,
      remainingSpots,
      confirmedCount,
      capacity
    };
  },

  createBooking: async (event, user, ticketType = 'General Admission') => {
    if (!event) throw new Error('Event is required.');
    if (!user) throw new Error('Please log in to register for this event.');

    if (event.priceType === 'paid' || event.price > 0) {
      throw new Error('Direct credit card payments are coming soon in our next release.');
    }

    const res = await apiClient.post(`/registrations/events/${event.id}/register`, {
      ticketType
    });

    if (!res?.booking) {
      throw new Error('Registration failed: no booking returned from server.');
    }

    const newBooking = {
      ...res.booking,
      userId: user.id
    };

    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    const updatedBookings = [newBooking, ...bookings.filter(b => b.id !== newBooking.id)];
    setItem(STORAGE_KEYS.BOOKINGS, updatedBookings);

    return newBooking;
  },

  cancelBooking: async (bookingId) => {
    await apiClient.delete(`/registrations/${bookingId}`);

    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
    setItem(STORAGE_KEYS.BOOKINGS, updated);

    return { id: bookingId, status: 'cancelled' };
  },

  exportAttendeesCSV: (event, attendees) => {
    if (!attendees || attendees.length === 0) {
      throw new Error('No attendee records available to export.');
    }

    const headers = ['Booking Ref', 'Attendee Name', 'Email', 'Ticket Type', 'Status', 'Registration Date'];
    const rows = attendees.map(a => [
      `"${a.bookingRef || a.bookingReference}"`,
      `"${a.attendeeName || a.name}"`,
      `"${a.attendeeEmail || a.email}"`,
      `"${a.ticketType || 'General Admission'}"`,
      `"${a.status}"`,
      `"${new Date(a.bookingDate || a.registeredAt || a.created_at || Date.now()).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.slug || event.id}-attendees-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};
