import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

// Helper to format payload for backend
const formatPayloadForBackend = (data) => {
  return {
    title: data.title,
    categoryId: data.categoryId,
    summary: data.summary || '',
    description: data.description || '',
    coverImageUrl: data.coverImage || data.coverImageUrl,
    startDatetime: data.startDatetime || (data.startDate ? `${data.startDate} 10:00:00` : new Date().toISOString()),
    endDatetime: data.endDatetime || (data.endDate ? `${data.endDate} 18:00:00` : new Date().toISOString()),
    venueName: data.venue || data.venueName || 'Main Venue',
    address: data.address || '',
    city: data.city || 'Mumbai',
    eventType: data.type || data.eventType || 'in-person',
    capacity: parseInt(data.capacity, 10) || 100,
    price: data.priceType === 'paid' ? parseFloat(data.price || 0) : 0,
    currency: data.currency || 'USD',
    status: data.status || 'published',
    featured: Boolean(data.featured)
  };
};

export const eventService = {
  // Sync latest events from backend API
  syncFromBackend: async () => {
    try {
      const res = await apiClient.get('/events?limit=100&dateFilter=all');
      if (res?.data && Array.isArray(res.data)) {
        setItem(STORAGE_KEYS.EVENTS, res.data);
        return res.data;
      }
    } catch {
      // Backend offline or error; gracefully use local cache
    }
    return getItem(STORAGE_KEYS.EVENTS, []);
  },

  getAllEvents: () => {
    return getItem(STORAGE_KEYS.EVENTS, []);
  },

  getPublicEvents: () => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return events.filter(e => e.status === 'published');
  },

  getEventById: (id) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return events.find(e => e.id === id || e.slug === id) || null;
  },

  getOrganizerEventsSync: (organizerId) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return Array.isArray(events) ? events.filter(e => e.organizerId === organizerId) : [];
  },

  getOrganizerEvents: async (organizerId) => {
    try {
      const res = await apiClient.get('/organizer/events');
      if (res?.events && Array.isArray(res.events)) {
        return res.events;
      }
    } catch {
      // fallback to filtered cache if offline
    }
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return Array.isArray(events) ? events.filter(e => e.organizerId === organizerId) : [];
  },

  createEvent: async (eventData) => {
    const payload = formatPayloadForBackend(eventData);
    const res = await apiClient.post('/events', payload);
    if (!res?.event) {
      throw new Error('Event creation failed: no event returned from server.');
    }
    const newEvent = res.event;
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    setItem(STORAGE_KEYS.EVENTS, [newEvent, ...events.filter(e => e.id !== newEvent.id)]);
    return newEvent;
  },

  updateEvent: async (id, updates) => {
    const payload = formatPayloadForBackend(updates);
    const res = await apiClient.put(`/events/${id}`, payload);
    if (!res?.event) {
      throw new Error('Event update failed.');
    }
    const updatedEvent = res.event;
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const updated = events.map(e => e.id === id ? updatedEvent : e);
    setItem(STORAGE_KEYS.EVENTS, updated);
    return updatedEvent;
  },

  deleteEvent: async (id) => {
    await apiClient.delete(`/events/${id}`);
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const filtered = events.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  updateEventStatus: async (id, status) => {
    const res = await apiClient.patch(`/events/${id}/status`, { status });
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const updated = events.map(e => e.id === id ? { ...e, status } : e);
    setItem(STORAGE_KEYS.EVENTS, updated);
    return res?.event || { id, status };
  },

  searchEvents: ({ query = '', category = '', priceType = '', dateFilter = '', city = '', sort = 'upcoming' } = {}) => {
    let events = getItem(STORAGE_KEYS.EVENTS, []);

    // Filter by query (title, summary, venue, city)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      events = events.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.summary && e.summary.toLowerCase().includes(q)) ||
        (e.city && e.city.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.venueName && e.venueName.toLowerCase().includes(q)) ||
        (e.categoryName && e.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by category slug or ID
    if (category && category !== 'all') {
      events = events.filter(e =>
        e.categoryId === category ||
        (e.categoryName && e.categoryName.toLowerCase().includes(category.toLowerCase())) ||
        (e.categorySlug && e.categorySlug.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter by price type
    if (priceType && priceType !== 'all') {
      events = events.filter(e => e.priceType === priceType);
    }

    // Filter by city
    if (city && city !== 'all') {
      events = events.filter(e => e.city && e.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      events = events.filter(e => e.startDate === today);
    } else if (dateFilter === 'upcoming') {
      events = events.filter(e => e.startDate >= today);
    } else if (dateFilter === 'past') {
      events = events.filter(e => e.startDate < today);
    }

    // Sort
    if (sort === 'upcoming') {
      events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sort === 'newest') {
      events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'popular') {
      events.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    }

    return events;
  }
};

// Initial background sync with backend API
if (typeof window !== 'undefined') {
  eventService.syncFromBackend();
}
