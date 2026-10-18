import { apiClient } from './apiClient';

export const DEMO_PASSWORD = 'EventSpearLocal!2026';

export const authService = {
  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.user || null;
    } catch {
      return null;
    }
  },

  login: async (email, password, expectedRole = null) => {
    const payload = { email: email.trim(), password };
    if (expectedRole) {
      payload.expectedRole = expectedRole;
    }
    const res = await apiClient.post('/auth/login', payload);
    return res.user;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      try {
        localStorage.removeItem('eventsphere_user');
        localStorage.removeItem('eventsphere_token');
        localStorage.removeItem('eventsphere_auth_user');
        localStorage.removeItem('eventsphere_bookings');
        localStorage.removeItem('eventsphere_notifications');
        sessionStorage.clear();
      } catch {
        // storage disabled or unavailable
      }
    }
    return null;
  },

  register: async ({ name, email, role, password, organization, city, bio }) => {
    const res = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      role: role || 'attendee',
      organization,
      city,
      bio
    });
    return res.user;
  }
};
